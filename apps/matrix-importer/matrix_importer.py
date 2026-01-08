import pandas as pd
import psycopg2
import argparse

parser = argparse.ArgumentParser(description="Import toll matrix data from Excel file")
parser.add_argument(
    "vehicle_class", type=int, help="Vehicle class number (e.g., 1, 2, 3)"
)
parser.add_argument(
    "--sheets",
    nargs="+",
    required=True,
    help="Sheet names to process (e.g., NLEX_SCTEX)",
    dest="to_process_sheets",
)
args = parser.parse_args()

VEHICLE_CLASS = args.vehicle_class
TO_PROCESS_SHEETS = args.to_process_sheets


class UpdateTask:

    def __init__(self, entry_name, exit_name, vehicle_class, new_fee, expressway):
        self.entry_name = entry_name
        self.exit_name = exit_name
        self.vehicle_class = vehicle_class
        self.new_fee = new_fee
        self.expressway = expressway

    def select_stmt(self):
        return f"""
           select *
            from
                toll_matrix tm
            where
                    tm.entry_point_id = (select
                                            p.id
                                        from
                                            point p
                                            inner join expressway e on p.expresway_id = e.id
                                        where
                                            trim(p.name) = '{self.entry_name}'
                                        and e.toll_network_id = '{self.expressway}')
            and   tm.exit_point_id = (select
                                            p.id
                                        from
                                            point p
                                            inner join expressway e on p.expresway_id = e.id
                                        where
                                            trim(p.name) = '{self.exit_name}'
                                        and e.toll_network_id = '{self.expressway}')
            and   vehicle_class = {self.vehicle_class}
            
            """

    def update_stmt(self):
        return f"""
           update toll_matrix tm
            set fee = {self.new_fee}
            where
                    tm.entry_point_id = (select
                                            p.id
                                        from
                                            point p
                                            inner join expressway e on p.expresway_id = e.id
                                        where
                                            trim(p.name) = '{self.entry_name}'
                                        and e.toll_network_id = '{self.expressway}')
            and   tm.exit_point_id = (select
                                            p.id
                                        from
                                            point p
                                            inner join expressway e on p.expresway_id = e.id
                                        where
                                            trim(p.name) = '{self.exit_name}'
                                        and e.toll_network_id = '{self.expressway}')
            and   vehicle_class = {self.vehicle_class}
            """


update_tasks = []

file_path = f"class{VEHICLE_CLASS}.xlsx"

df = pd.read_excel(file_path)

all_sheets = pd.read_excel(file_path, sheet_name=None)

# Iterate through each sheet
for sheet_name, df in all_sheets.items():
    if sheet_name not in TO_PROCESS_SHEETS:
        continue

    print(f"\nSheet: {sheet_name}")

    for index, row in df.iterrows():
        if index == 0:
            continue

        exit_point = row.iloc[0]

        i = 0
        for col_name in df.columns:
            if i == 0:
                i += 1
                continue

            # Check if the cell is empty
            if pd.isna(row[col_name]):
                continue
            val = float(row[col_name])

            update_tasks.append(
                UpdateTask(col_name, exit_point, VEHICLE_CLASS, val, sheet_name)
            )


conn = psycopg2.connect(
    dbname="railway",
    user="postgres",
    password="YvLQDahSioySlJoaSFNpXOdrVTBIBKHK",
    host="monorail.proxy.rlwy.net",  # usually "localhost" if running locally
    port="40021",  # default PostgreSQL port
)

cur = conn.cursor()

for task in update_tasks:
    cur.execute(task.select_stmt())
    records = cur.fetchall()

    if len(records) == 0:
        print(f"No records found for {task.entry_name} to {task.exit_name}")
        continue

    for record in records:

        if record[2] == task.new_fee:
            print(f"Skipping {task.entry_name} to {task.exit_name}")
            continue

        print(f"{task.entry_name} to {task.exit_name}: {record[2]} -> {task.new_fee}")

        try:
            cur.execute(task.update_stmt())
        except Exception as e:
            print(e)


conn.commit()
cur.close()
conn.close()

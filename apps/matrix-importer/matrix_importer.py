import pandas as pd
import psycopg2
import sys

VEHICLE_CLASS = 2

print(sys.argv[0])


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
        print(
            f"{task.entry_name} to {task.exit_name}  Old: {record[2]} -> {task.new_fee}"
        )

        try:
            cur.execute(task.update_stmt())
        except Exception as e:
            print(e)


conn.commit()
cur.close()
conn.close()

import pandas as pd
import psycopg2


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
                toll_matrix
            where
                    entry_point_id = (select id from point where trim(name) = '{self.entry_name}' and expresway_id = '{self.expressway}')
            and   exit_point_id = (select id from point where trim(name) = '{self.exit_name}' and expresway_id = '{self.expressway}')
            and   vehicle_class = {self.vehicle_class}
            """


update_tasks = []

file_path = "class1.xlsx"

df = pd.read_excel(file_path)

all_sheets = pd.read_excel(file_path, sheet_name=None)

# Iterate through each sheet
for sheet_name, df in all_sheets.items():
    print(f"\nSheet: {sheet_name}")

    for index, row in df.iterrows():
        if index == 0:
            continue

        exit_point = row[0]

        i = 0
        for col_name in df.columns:
            if i == 0:
                i += 1
                continue

            # Check if the cell is empty
            if pd.isna(row[col_name]):
                continue
            val = row[col_name]

            update_tasks.append(UpdateTask(col_name, exit_point, 1, val, sheet_name))


conn = psycopg2.connect(
    dbname="railway",
    user="postgres",
    password="YvLQDahSioySlJoaSFNpXOdrVTBIBKHK",
    host="monorail.proxy.rlwy.net",  # usually "localhost" if running locally
    port="40021",  # default PostgreSQL port
)

# Open a cursor to perform database operations
cur = conn.cursor()

# Execute a query

for task in update_tasks:
    cur.execute(task.select_stmt())
    # Retrieve query results
    records = cur.fetchall()

    if len(records) == 0:
        print(f"No records found for {task.entry_name} to {task.exit_name}")
        continue

    for record in records:
        print(
            f"{task.entry_name} to {task.exit_name}  Old: {record[2]} -> {task.new_fee}"
        )


# Close the cursor and connection
cur.close()
conn.close()

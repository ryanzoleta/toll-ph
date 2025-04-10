import pandas as pd

statements = []

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

            stmt = f"""
            select *
            from
                toll_matrix
            where
                    entry_point_id = (select id from point where trim(name) = '{col_name}' and expresway_id = 'TPLEX')
            and   exit_point_id = (select id from point where trim(name) = '{exit_point}' and expresway_id = 'TPLEX')
            and   vehicle_class = 1
            """

            statements.append(stmt)


print(statements)

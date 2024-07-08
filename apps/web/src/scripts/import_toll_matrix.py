import csv

entry_ids = []
matrix_entries = []

with open("tplex.csv") as csv_file:
    csv_reader = csv.reader(csv_file, delimiter=",")
    line_count = 0
    for row in csv_reader:
        if line_count == 0:
            for c in row:
                entry_ids.append(c.strip())
        else:
            total_cols = len(row)
            exit_id = row[0].strip()

            for i in range(1, total_cols):
                entry_id = entry_ids[i]
                fee = row[i].strip()

                if fee != "":
                    print(f"From {entry_id} to {exit_id} {row[i].strip()}")
                    matrix_entries.append(
                        {"entry_id": entry_id, "exit_id": exit_id, "fee": fee}
                    )
        line_count += 1


with open("output.csv", mode="w") as csv_file:
    fieldnames = ["entry_id", "exit_id", "fee"]
    writer = csv.DictWriter(csv_file, fieldnames=fieldnames)

    writer.writeheader()

    for entry in matrix_entries:
        writer.writerow(entry)

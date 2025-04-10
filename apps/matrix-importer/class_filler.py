import psycopg2

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

cur.execute("select * from toll_matrix where vehicle_class = 1")
records = cur.fetchall()

count = 1
for r in records:
    print(f"Inserting record # {count}")

    stmt = f"insert into toll_matrix (entry_point_id, exit_point_id, fee, reversible, vehicle_class) values ({r[0]}, {r[1]}, 0, {r[3]}, 3)"

    try:
        cur.execute(stmt)
    except:
        print("Duplicate entry")

    count += 1


conn.commit()
cur.close()
conn.close()

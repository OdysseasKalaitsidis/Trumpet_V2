import sqlite3
import os
import sys

def migrate(sqlite_db_path, output_sql_path):
    if not os.path.exists(sqlite_db_path):
        print(f"Error: SQLite database not found at {sqlite_db_path}")
        return

    conn = sqlite3.connect(sqlite_db_path)
    cursor = conn.cursor()

    with open(output_sql_path, 'w', encoding='utf-8') as f:
        f.write("SET NAMES utf8mb4;\n")
        f.write("SET FOREIGN_KEY_CHECKS = 0;\n\n")

        tables = ['Communities', 'Collections', 'Items', 'MetadataValues', 'Bitstreams']

        for table in tables:
            print(f"Migrating table: {table}...")
            cursor.execute(f"SELECT * FROM {table}")
            rows = cursor.fetchall()
            
            # Get column names
            cursor.execute(f"PRAGMA table_info({table})")
            columns = [col[1] for col in cursor.fetchall()]
            col_str = ", ".join([f"`{c}`" for c in columns])

            if not rows:
                print(f"Table {table} is empty.")
                continue

            f.write(f"-- Data for {table}\n")
            for row in rows:
                values = []
                for val in row:
                    if val is None:
                        values.append("NULL")
                    elif isinstance(val, (int, float)):
                        values.append(str(val))
                    else:
                        # Escape single quotes for SQL
                        escaped_val = str(val).replace("'", "''")
                        values.append(f"'{escaped_val}'")
                
                val_str = ", ".join(values)
                f.write(f"INSERT INTO `{table}` ({col_str}) VALUES ({val_str});\n")
            f.write("\n")

        f.write("SET FOREIGN_KEY_CHECKS = 1;\n")

    conn.close()
    print(f"Migration script generated at {output_sql_path}")

if __name__ == "__main__":
    # Default paths
    sqlite_db = "data/database/trumpet.db"
    output_sql = "database/dump.sql"
    
    if len(sys.argv) > 1:
        sqlite_db = sys.argv[1]
    if len(sys.argv) > 2:
        output_sql = sys.argv[2]
        
    migrate(sqlite_db, output_sql)

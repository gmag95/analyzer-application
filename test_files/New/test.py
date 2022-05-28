import psycopg

with psycopg.connect("dbname=analyzer user=postgres password=Bollate18 host=140.238.216.93") as conn:

        with conn.cursor() as cur:

            try: 
                cur.execute("select user_code from user_list where user_code <> 13")

                result = []

                for el in cur.fetchall():
    
                    result.append(el[0])

                print(result)

            except Exception as err:

                print(err)
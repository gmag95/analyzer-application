import psycopg
import pandas as pd
import csv
import random
from datetime import date
import locale
locale.setlocale(locale.LC_ALL, "en_US.UTF-8")
import glob
import os

def start_loading(date_used):

    user_code_list = user_code_query()

    postingsfile = open(f"output_postings_{date_used}.csv", "w", newline='')

    postingwriter = csv.writer(postingsfile, delimiter=";")

    postingwriter.writerow(["gl_code", "position", "amount", "cost_center", "reg_date", "acc_center", "eff_date", "policy_num", "discount", "pay_mode", "suppl_code", "country_code"])

    accounting_manual = pd.read_csv("accounting_manual.csv", sep=";", dtype=str)

    for _ in range(10):

        populate_postings(postingwriter, accounting_manual, date_used)

    documentfile = open(f"output_document_{date_used}.csv", "w", newline='')

    documentwriter = csv.writer(documentfile, delimiter=";")

    documentwriter.writerow(["user_code", "document_date", "document_type", "company"])

    documentwriter.writerow([random.choice(user_code_list), date_used, "A001", "8888"])

    postingsfile.close()

    documentfile.close()

    loading_data(date_used, "00")

    if date.today().month != 12:

        postingsfile = open(f"output_postings_0B_{date_used}.csv", "w", newline='')

        postingwriter = csv.writer(postingsfile, delimiter=";")

        postingwriter.writerow(["gl_code", "position", "amount", "cost_center", "reg_date", "acc_center", "eff_date", "policy_num", "discount", "pay_mode", "suppl_code", "country_code"])

        accounting_manual = pd.read_csv("accounting_manual_0B.csv", sep=";", dtype=str)

        populate_postings_0B(postingwriter, accounting_manual, date_used)

        documentfile = open(f"output_document_0B_{date_used}.csv", "w", newline='')

        documentwriter = csv.writer(documentfile, delimiter=";")

        documentwriter.writerow(["user_code", "document_date", "document_type", "company"])

        documentwriter.writerow([random.choice(user_code_list), date_used, "B112", "8888"])

        postingsfile.close()

        documentfile.close()

        loading_data(date_used, "0B")

    fileList = glob.glob('output*.csv')

    for filePath in fileList:
        try:
            os.remove(filePath)
        except:
            print("Error while deleting file : ", filePath)


def loading_data(date_used, data):

    with psycopg.connect("dbname=analyzer user=postgres password=Bollate18 host=140.238.216.93") as conn:

        with conn.cursor() as cur:

            try: 
                cur.execute("create temp table temp_document (user_code integer not null, document_date date not null, document_type varchar(4) not null, company varchar(4) not null)")

                cur.execute("create temp table temp_postings (gl_code varchar(10) not null, position integer not null, amount numeric(20, 4) not null, cost_center varchar(4), reg_date date not null, acc_center varchar(4), eff_date date not null, policy_num integer, discount numeric(5,4), pay_mode varchar(4), suppl_code varchar(4), country_code varchar(4), document_num integer)")

                if data == "00":

                    postings = open(f"./output_postings_{date_used}.csv", "r")

                    document = open(f"./output_document_{date_used}.csv", "r")
                
                else: 

                    postings = open(f"./output_postings_0B_{date_used}.csv", "r")

                    document = open(f"./output_document_0B_{date_used}.csv", "r")

                with cur.copy("COPY temp_postings(gl_code, position, amount, cost_center, reg_date, acc_center, eff_date, policy_num, discount, pay_mode, suppl_code, country_code) FROM STDIN WITH (FORMAT CSV, HEADER, DELIMITER ';')") as copy: 
                    copy.write(postings.read())

                with cur.copy("COPY temp_document(user_code, document_date, document_type, company) FROM STDIN WITH (FORMAT CSV, HEADER, DELIMITER ';')") as copy:
                    copy.write(document.read())

                cur.execute("call data_loading()")

                conn.commit()

                print(f"{data} postings loaded for the date {date_used}")

            except Exception as err:

                print(err)

def populate_postings(postingwriter, accounting_manual, date_used):

    for index, row in accounting_manual.iterrows():

        rand_num = random.randrange(0, 20)/20

        amount = float(str(random.randrange(locale.atof(row["min_amount"]), locale.atof(row["max_amount"])))+"."+str(random.randrange(0, 1000)))
        if row["frequency"] != "1" and rand_num < locale.atof(row["frequency"]):
            country_code = random.randrange(1,6)*1000
            postingwriter.writerow([row["debit_account"], "40", amount, row["cost_center"], date_used, row["acc_center"], date_used, None, None, None, None, country_code])
            postingwriter.writerow([row["credit_account"], "50", amount*-1, row["cost_center"], date_used, row["acc_center"], date_used, None, None, None, None, country_code])

        if row["frequency"] == "1":
            country_code = random.randrange(1,6)*1000
            policy_num=random.randrange(30000,31000)
            postingwriter.writerow([row["debit_account"], "40", amount, row["cost_center"], date_used, row["acc_center"], date_used, policy_num, None, None, None, country_code])
            postingwriter.writerow([row["credit_account"], "50", amount*-1, row["cost_center"], date_used, row["acc_center"], date_used, policy_num, None, None, None, country_code])

def populate_postings_0B(postingwriter, accounting_manual, date_used):

    for index, row in accounting_manual.iterrows():

        policy_num = None

        if row["frequency"] == "1":
            policy_num=random.randrange(30000,31000)

        amount = float(str(random.randrange(locale.atof(row["min_amount"]), locale.atof(row["max_amount"])))+"."+str(random.randrange(0, 1000)))
        country_code = random.randrange(1,6)*1000
        postingwriter.writerow([row["debit_account"], "40", amount, row["cost_center"], date_used, row["acc_center"], date_used, policy_num, None, None, None, country_code])
        postingwriter.writerow([row["credit_account"], "50", amount*-1, row["cost_center"], date_used, row["acc_center"], date_used, policy_num, None, None, None, country_code])

def user_code_query():

    with psycopg.connect("dbname=analyzer user=postgres password=Bollate18 host=140.238.216.93") as conn:

        with conn.cursor() as cur:

            try: 
                cur.execute("select user_code from user_list where user_code <> 13")

                result = []

                for el in cur.fetchall():
    
                    result.append(el[0])

                return result

            except Exception as err:

                print(err)

start_loading(f"{date.today().year}-{date.today().month}-{date.today().day}")
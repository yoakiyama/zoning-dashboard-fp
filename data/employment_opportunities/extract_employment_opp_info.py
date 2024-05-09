#!/usr/bin/env python3
import numpy as np
import pandas as pd

zip_map = pd.read_table("../transportation/mbta/zips_to_hoods.tsv")
zip_neighborhoods = {f"0{x.zip}":x.neighborhoods.split(",") for x in zip_map.itertuples()}
neighborhood_names = []
for hoods in zip_neighborhoods.values():
    neighborhood_names.extend(hoods)
neighborhood_names = np.unique(neighborhood_names).tolist()

num_employees = np.zeros(len(neighborhood_names))
num_establishments = np.zeros(len(neighborhood_names))
ann_payroll = np.zeros(len(neighborhood_names))
q1_payroll = np.zeros(len(neighborhood_names))

orig_file = open("CBP2021.CB2100CBP-Data.txt", 'r')

header = orig_file.readline().split('\t')

zip_idx = header.index("NAME")
emp_size_idx = header.index("EMPSZES_LABEL")
sector_idx = header.index("NAICS2017_LABEL")

num_est_idx = header.index("ESTAB")
ann_pay_idx = header.index("PAYANN")
q1_pay_idx = header.index("PAYQTR1")
num_emp_idx = header.index("EMP")
orig_line = orig_file.readline()
orig_line = orig_file.readline()

# so we can check which zipcodes are missing from the downloaded data
seen_zip = set()

while(orig_line):
    orig_split = orig_line.split('\t')

    if(orig_split[emp_size_idx] == "All establishments" and orig_split[sector_idx] == "Total for all sectors"):
        try:
            neigh_val = zip_neighborhoods[orig_split[zip_idx][5:10]]
        except:
            # not one of our zipcodes
            orig_line = orig_file.readline()
            continue

        if isinstance(neigh_val, list):
            print(neigh_val)
            for neigh in neigh_val:
                neigh_idx = neighborhood_names.index(neigh)

                num_employees[neigh_idx] += int(orig_split[num_emp_idx])
                num_establishments[neigh_idx] += int(orig_split[num_est_idx])
                ann_payroll[neigh_idx] += int(orig_split[ann_pay_idx])
                q1_payroll[neigh_idx] += int(orig_split[q1_pay_idx])

        else:
            neigh_idx = neighborhood_names.index(neigh_val)
            num_employees[neigh_idx] += int(orig_split[num_emp_idx])
            num_establishments[neigh_idx] += int(orig_split[num_est_idx])
            ann_payroll[neigh_idx] += int(orig_split[ann_pay_idx])
            q1_payroll[neigh_idx] += int(orig_split[q1_pay_idx])

        seen_zip.add(orig_split[zip_idx][5:10])
    orig_line = orig_file.readline()

for zipcode in zip_neighborhoods:
    if zipcode not in seen_zip:
        print("Missing", zipcode)

orig_file.close()

# save results to file
out = open("parsed_employment_data.txt", 'w')
out.write("NEIGHBORHOOD\tNUM_EST\tNUM_EMP\tPAY_ANN\tPAY_QTR1\tANN_PAY_DIV_EMP\n")
for i in range(len(neighborhood_names)):
    out.write(neighborhood_names[i] + '\t' + str(int(num_establishments[i])) + '\t' + str(int(num_employees[i])) + '\t' + str(int(ann_payroll[i])) + '\t' + str(int(q1_payroll[i])) + '\t' + str(ann_payroll[i]/num_employees[i]) + '\n')
out.close()

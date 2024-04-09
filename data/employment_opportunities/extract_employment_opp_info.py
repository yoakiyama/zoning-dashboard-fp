#!/usr/bin/env python3
import numpy as np

neighborhood_names = ["Allston/Brighton", "Back Bay/Beacon Hill", "Central Boston", "Charlestown", "Dorchester", "East Boston", "Fenway/Kenmore", "Hyde Park", "Jamaica Plain", "Mattapan", "Roslindale", "Roxbury", "South Boston", "South End", "West Roxbury"]

zip_neighborhoods = {
    "02134" : "Allston/Brighton",
    "02135" : "Allston/Brighton",
    "02163" : "Allston/Brighton",
    "02108" : "Back Bay/Beacon Hill",
    "02116" : "Back Bay/Beacon Hill",
    "02117" : "Back Bay/Beacon Hill",
    "02123" : "Back Bay/Beacon Hill",
    "02133" : "Back Bay/Beacon Hill",
    "02199" : "Back Bay/Beacon Hill",
    "02216" : "Back Bay/Beacon Hill",
    "02217" : "Back Bay/Beacon Hill",
    "02295" : "Back Bay/Beacon Hill",
    "02101" : "Central Boston",
    "02102" : "Central Boston",
    "02103" : "Central Boston",
    "02104" : "Central Boston",
    "02105" : "Central Boston",
    "02106" : "Central Boston",
    "02107" : "Central Boston",
    "02109" : "Central Boston",
    "02110" : "Central Boston",
    "02111" : "Central Boston",
    "02112" : "Central Boston",
    "02113" : "Central Boston",
    "02114" : "Central Boston",
    "02196" : "Central Boston",
    "02201" : "Central Boston",
    "02202" : "Central Boston",
    "02203" : "Central Boston",
    "02204" : "Central Boston",
    "02205" : "Central Boston",
    "02206" : "Central Boston",
    "02207" : "Central Boston",
    "02208" : "Central Boston",
    "02209" : "Central Boston",
    "02211" : "Central Boston",
    "02212" : "Central Boston",
    "02222" : "Central Boston",
    "02293" : "Central Boston",
    "02129" : "Charlestown",
    "02122" : "Dorchester",
    "02124" : "Dorchester",
    "02125" : "Dorchester",
    "02128" : "East Boston",
    "02228" : "East Boston",
    "02115" : "Fenway/Kenmore",
    "02215" : "Fenway/Kenmore",
    "02136" : "Hyde Park",
    "02130" : "Jamaica Plain",
    "02126" : "Mattapan",
    "02131" : "Roslindale",
    "02119" : "Roxbury",
    "02120" : "Roxbury",
    "02121" : "Roxbury",
    "02127" : "South Boston",
    "02210" : "South Boston",
    "02118" : "South End",
    "02132" : "West Roxbury"
    }

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
            neigh_idx = neighborhood_names.index(zip_neighborhoods[orig_split[zip_idx][5:10]])
        except:
            # not one of our zipcodes
            orig_line = orig_file.readline()
            continue

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

## calculate population sizes to normalize data

population = np.zeros(len(neighborhood_names))
census_file = open("DECENNIALDHC2020.P1-Data.txt", 'r')

census_line = census_file.readline()
census_line = census_file.readline()
census_line = census_file.readline()

while(census_line):
    census_split = census_line.split()

    try:
        neigh_idx = neighborhood_names.index(zip_neighborhoods[census_split[2]])
    except:
        # not one of our zipcodes
        census_line = census_file.readline()
        continue

    population[neigh_idx] += int(census_split[3])

    census_line = census_file.readline()

census_file.close()

# save results to file
out = open("parsed_employment_data.txt", 'w')
out.write("NEIGHBORHOOD\tNUM_EST\tNUM_EMP\tPAY_ANN\tPAY_QTR1\tPOP\tNORM_EST\tNORM_EMP\tNORM_PAY_ANN\tNORM_PAY_QTR1\tANN_PAY_DIV_EMP\n")
for i in range(len(neighborhood_names)):
    out.write(neighborhood_names[i] + '\t' + str(int(num_establishments[i])) + '\t' + str(int(num_employees[i])) + '\t' + str(int(ann_payroll[i])) + '\t' + str(int(q1_payroll[i])) + '\t' + str(int(population[i])) + '\t' + str(num_establishments[i]/population[i]) + '\t' + str(num_employees[i]/population[i]) + '\t' + str(ann_payroll[i]/population[i]) + '\t' + str(q1_payroll[i]/population[i]) + '\t' + str(ann_payroll[i]/num_employees[i]) + '\n')

out.close()

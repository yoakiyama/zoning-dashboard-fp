#!/usr/bin/env python3
import numpy as np

neighborhood_names = ["Allston/Brighton", "Back Bay/Beacon Hill", "Central Boston", "Charlestown", "Dorchester", "East Boston", "Fenway/Kenmore", "Hyde Park", "Jamaica Plain", "Mattapan", "Roslindale", "Roxbury", "South Boston", "South End", "West Roxbury"]

sector_names = ["Accommodation and food services", "Administrative and support and waste management and remediation services", "Arts, entertainment, and recreation", "Construction", "Educational services", "Finance and insurance", "Health care and social assistance", "Industries not classified", "Information", "Management of companies and enterprises", "Manufacturing", "Professional, scientific, and technical services", "Real estate and rental and leasing", "Retail trade", "Transportation and warehousing", "Utilities", "Wholesale trade", "Other services (except public administration)", "Total for all sectors"]



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

orig_file = open("CBP2021.CB2100CBP-Data.txt", 'r')

header = orig_file.readline().split('\t')

zip_idx = header.index("NAME")
emp_size_idx = header.index("EMPSZES_LABEL")
sector_idx = header.index("NAICS2017_LABEL")
num_est_idx = header.index("ESTAB")
orig_line = orig_file.readline()
orig_line = orig_file.readline()

counts = np.zeros((len(neighborhood_names), len(sector_names)))

while(orig_line):
    orig_split = orig_line.split('\t')

    if(orig_split[emp_size_idx] == "All establishments"):
        try:
            neigh_idx = neighborhood_names.index(zip_neighborhoods[orig_split[zip_idx][5:10]])
        except:
            # not one of our zipcodes
            orig_line = orig_file.readline()
            continue

        sector = sector_names.index(orig_split[sector_idx].strip('"'))

        counts[neigh_idx][sector] += int(orig_split[num_est_idx])

    orig_line = orig_file.readline()

orig_file.close()

# save results to file
out = open("aggregated_establishments_by_industry_data.txt", 'w')
out.write("NEIGHBORHOOD")
for sector in sector_names:
    out.write('\t' + sector)
out.write('\n')

for i in range(len(neighborhood_names)):
    out.write(neighborhood_names[i])
    for j in range(len(sector_names)):
        out.write('\t' + str(int(counts[i][j])))
    out.write('\n')

out.close()

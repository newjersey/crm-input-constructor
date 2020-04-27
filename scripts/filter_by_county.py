import sys
from csv import writer
from csv import reader

# application counts, not application IDs
MIN = 0
MAX = 9999999

# usage
if len(sys.argv) != 4:
  print("Usage: ", sys.argv[0], "<county> <csv> <out>")
  sys.exit(2)

county = sys.argv[1]
csv = sys.argv[2]
out = sys.argv[3]

print("county", county)
print("csv", csv)
print("out", out)

# Open the input_file in read mode and output_file in write mode
with open(out, 'w') as write_obj, \
        open(csv, 'r') as read_obj:
    # Create csv.reader objectS from the input file object
    csv_reader = reader(read_obj)
    # Create a csv.writer object from the output file object
    csv_writer = writer(write_obj)
    # Read each row of the input csv file as list
    i = 0
    n = 0
    county_index = None
    for row in csv_reader:
        if i == 0:
            county_index = row.index("county") # lower-case is the good one (from fuzzy match geo script)
            csv_writer.writerow(row)
        elif row[county_index].strip() == county.strip() and i >= MIN and i <= MAX:
            # Add the row / list to the output file
            csv_writer.writerow(row)
            n += 1
        i += 1

print("Wrote {} applications from {} County to {}".format(n, county, out))

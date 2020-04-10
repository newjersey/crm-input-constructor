from fuzzywuzzy import fuzz
from fuzzywuzzy import process
import csv
import sys

if len(sys.argv) == 1:
  print "Usage:", sys.argv[0], "<input file from taxation>"
  sys.exit(2)

csvwriter = csv.writer(sys.stdout)
csvwriter.writerow(['EIN', 'AppNum', 'EDA Name', 'Taxation NAME', 'NAICS CODE', 'Clean Indicator', 'Name Confidence'])

with open(sys.argv[1], 'r') as reader:
    line = reader.readline()

    while line != '':  # The EOF char is an empty string
        parts = line.split("|")

        # 40% and above confidence is about right
        name_confidence = fuzz.ratio(parts[2].strip().upper(),
                                     parts[3].strip().upper())

        csvwriter.writerow([parts[0].strip(),
                            parts[1].strip(),
                            parts[2].strip(),
                            parts[3].strip(),
                            parts[4].strip(),
                            parts[5].strip(),
                            name_confidence])

        line = reader.readline()

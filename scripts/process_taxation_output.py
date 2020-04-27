from fuzzywuzzy import fuzz
from fuzzywuzzy import process
import csv
import sys
import re

naics_re = re.compile('^\d{6}$')

if len(sys.argv) == 1:
  print "Usage:", sys.argv[0], "<input file from taxation>"
  sys.exit(2)

csvwriter = csv.writer(sys.stdout)
csvwriter.writerow(['EIN', 'AppNum', 'EDA Name', 'Taxation NAME', 'NAICS CODE', 'Clean Indicator', 'Name Confidence'])

with open(sys.argv[1], 'r') as csvfile:
    readCSV = csv.reader(csvfile)
    n = 1
    for row in readCSV:
        if n == 1:
          n += 1
          continue

        # 40% and above confidence is about right
        name_confidence = fuzz.ratio(row[2].strip().upper(),
                                     row[3].strip().upper())

        csvwriter.writerow([row[0].strip(),
                            row[1].strip(),
                            row[2].strip(),
                            row[3].strip(),
                            row[4].strip() if naics_re.match(row[4].strip()) else "",
                            row[5].strip(),
                            name_confidence])

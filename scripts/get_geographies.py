from fuzzywuzzy import fuzz
from fuzzywuzzy import process
import csv
import sys
import re

# both inclusive
MIN=0 #26
MAX=999999 #1300

DEBUG=True
DEBUG_CONFIDENCE_THRESHOLD=70
CONFIDENCE_THRESHOLD=DEBUG_CONFIDENCE_THRESHOLD

INPUT_CITY_INDEX = 20
INPUT_ZIP5_INDEX = 24
OUTPUT_HEADERS = ['county', 'localname', 'incmunc', 'czip', 'legdist', 'congdist', 'target', 'njda_regio', 'is_multi', 'dca_code', 'dol_code', 'normalized_city', 'appId']

# usage
if len(sys.argv) != 3:
  print("Usage:", sys.argv[0], "<applications csv> <zips csv>")
  sys.exit(2)

# command line args
applications_csv = sys.argv[1]
zips_csv = sys.argv[2]

# regex stuff
descriptors = re.compile('^(N|S|E|W|NORTH|SOUTH|EAST|WEST|MT|MOUNT|UPPER|LOWER)\.?\s|(\s(JCT|PARK|PK|JUNCTION|TOWN|TOWNSHIP|CITY|BOROUGH|VILLAGE|TWP|BORO)\.?$)|(\,? NJ$)')
zip = re.compile('^\d{5}$')

# start output
if DEBUG:
    print('\nPrinting applications with stated cities that don\'t match any cities known in their stated zip code (<' + str(DEBUG_CONFIDENCE_THRESHOLD) + '% confidence):\n')
else:
    csvwriter = csv.writer(sys.stdout)
    csvwriter.writerow(OUTPUT_HEADERS)

with open(applications_csv, 'r') as csvfile:
    readCSV = csv.reader(csvfile)
    glitchy = 0

    # for each application...
    n = -1
    for row in readCSV:
        n += 1
        if not(n >= MIN and n <= MAX):
            continue

        zip5 = row[INPUT_ZIP5_INDEX].strip()
        city = row[INPUT_CITY_INDEX].strip().upper()
        zipRowCandidates = []

        # skip header row
        if not zip.match(zip5):
            continue

        # loop over all matching zip codes
        with open(zips_csv) as f:
            reader = csv.reader(f)
            for zipRow in reader:
                # matching zip found, store as candidate
                if zip5 == zipRow[3].strip():
                    zipRowCandidates.append(zipRow)

        # loop over all candidate zip codes
        bestConfidence = 0
        bestRow = None
        for zipRow in zipRowCandidates:
            city_confidence = fuzz.ratio(city, zipRow[1].strip().upper())
            if city_confidence > bestConfidence:
                bestConfidence = city_confidence
                bestRow = zipRow

        # try with some replacements
        if bestConfidence < 100:
            for zipRow in zipRowCandidates:
                city_confidence = fuzz.ratio(city, re.sub(descriptors, '', zipRow[1].strip().upper()))
                if city_confidence > bestConfidence:
                    bestConfidence = city_confidence
                    bestRow = zipRow

        # try with some replacements
        if bestConfidence < 100:
            for zipRow in zipRowCandidates:
                city_confidence = fuzz.ratio(re.sub(descriptors, '', city), zipRow[1].strip().upper())
                if city_confidence > bestConfidence:
                    bestConfidence = city_confidence
                    bestRow = zipRow

        # try with some replacements
        if bestConfidence < 100:
            for zipRow in zipRowCandidates:
                city_confidence = fuzz.ratio(re.sub(descriptors, '', city), re.sub(descriptors, '', zipRow[1].strip().upper()))
                if city_confidence > bestConfidence:
                    bestConfidence = city_confidence
                    bestRow = zipRow

        # try with some replacements
        if bestConfidence < 100:
            for zipRow in zipRowCandidates:
                city_confidence = fuzz.ratio(city, zipRow[2].strip().upper())
                if city_confidence > bestConfidence:
                    bestConfidence = city_confidence
                    bestRow = zipRow

        # try with some replacements
        if bestConfidence < 100:
            for zipRow in zipRowCandidates:
                city_confidence = fuzz.ratio(city, re.sub(descriptors, '', zipRow[2].strip().upper()))
                if city_confidence > bestConfidence:
                    bestConfidence = city_confidence
                    bestRow = zipRow

        # try with some replacements
        if bestConfidence < 100:
            for zipRow in zipRowCandidates:
                city_confidence = fuzz.ratio(re.sub(descriptors, '', city), zipRow[2].strip().upper())
                if city_confidence > bestConfidence:
                    bestConfidence = city_confidence
                    bestRow = zipRow

        # try with some replacements
        if bestConfidence < 100:
            for zipRow in zipRowCandidates:
                city_confidence = fuzz.ratio(re.sub(descriptors, '', city), re.sub(descriptors, '', zipRow[2].strip().upper()))
                if city_confidence > bestConfidence:
                    bestConfidence = city_confidence
                    bestRow = zipRow

        if DEBUG:
            if bestConfidence < DEBUG_CONFIDENCE_THRESHOLD:
                glitchy += 1
                print(str(glitchy) + '.')
                print('CV19L' + row[0] + ' (' + zip5 + ')')
                print('  User reported: ' + row[INPUT_CITY_INDEX].strip())
                print('  Closest match: ' + (bestRow[1] if bestRow else '(none)'))
                print('  Confidence:    ' + str(bestConfidence) + '%')
                print('  Cities in zip: ' + str([row[1].strip() for row in zipRowCandidates]))
                print('')
        else:
            # normalized city: from ZIP file for high-confidence (fix typos), user input for low-confidence
            normalized_city = bestRow[1] if bestRow and bestConfidence > CONFIDENCE_THRESHOLD else "???" #row[INPUT_CITY_INDEX]
            geo_array = [bestRow[i].strip() for i in xrange(len(bestRow))]
            csvwriter.writerow(geo_array + [normalized_city.strip(), row[0]])

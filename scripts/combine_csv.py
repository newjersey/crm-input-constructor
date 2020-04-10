import sys

# usage
if len(sys.argv) != 3:
  print("Usage:", sys.argv[0], "<csv1> <csv2>")
  sys.exit(2)

csvA = (sys.argv[1])
csvB = (sys.argv[2])

fileA = open(csvA, 'r')
fileB = open(csvB, 'r')

linesA = fileA.readlines()
linesB = fileB.readlines()

i = 0
# Strips the newline character
for lineA in linesA:
    print("{},{}".format(lineA.strip(), linesB[i].strip()))
    i += 1

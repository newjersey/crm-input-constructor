import sys
from csv import writer
from csv import reader

# usage
if len(sys.argv) != 4:
  print("Usage:", sys.argv[0], "<csv1> <csv2> <out>")
  sys.exit(2)

csvA = sys.argv[1]
csvB = sys.argv[2]
out = sys.argv[3]

print("csvA", csvA)
print("csvB", csvB)
print("out", out)

# Open the input_file in read mode and output_file in write mode
with open(out, 'w') as write_obj, \
        open(csvA, 'r') as read_objA, \
        open(csvB, 'r') as read_objB:
    # Create csv.reader objectS from the input file object
    csv_readerA = reader(read_objA)
    csv_readerB = reader(read_objB)
    # Create a csv.writer object from the output file object
    csv_writer = writer(write_obj)
    # Read each row of the input csv file as list
    for rowA in csv_readerA:
        for col in csv_readerB.next():
            rowA.append(col)
        # Add the updated row / list to the output file
        print(rowA)
        csv_writer.writerow(rowA)

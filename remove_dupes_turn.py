# Author Kunal Kulkarni - knkulkarni@ebay.com

import os
import sys

if len(sys.argv) != 4:
        print "Please supply <Dup Window> <Input Dir> <Out Dir> as command line arguments to this Python program"
        sys.exit()
else:
        dup_window=sys.argv[1]
        in_dir = sys.argv[2]
        out_file = sys.argv[3]

try:
        fread = open(in_dir+"/000000_0","r")
        fwrite = open(out_file,"w")

        prev = fread.readline()
        fwrite.write(prev)
        rest = fread.readlines()
except IOError as e:
        print "I/O error({0}): {1}".format(e.errno, e.strerror)
        sys.exit()
except:
        print "Unexpected error while doing file operations"
        sys.exit()

for i in range(0, len(rest)):
        cur = rest[i]
        prev_array = prev.split(',')
        cur_array = cur.split(',')

        # First check if the difference in the action_timestamps of two events
        # If the difference is >= 60 they are not dupes
        if (int(prev_array[22]) - int(cur_array[22])) >= dup_window:
                fwrite.write(cur)
        else:
        # If any of the other columns are not same, they are not dupes
                if not(prev_array[0]==cur_array[0] and prev_array[1]==cur_array[1] and prev_array[2]==cur_array[2] and prev_array[3]==cur_array[3] and prev_array[4]==cur_array[4] and prev_array[5]==cur_array[5] and prev_array[6]==cur_array[6] and prev_array[7]==cur_array[7] and prev_array[8]==cur_array[8] and prev_array[9]==cur_array[9] and prev_array[10]==cur_array[10] and prev_array[11]==cur_array[11] and prev_array[12]==cur_array[12] and prev_array[13]==cur_array[13] and prev_array[14]==cur_array[14] and prev_array[15]==cur_array[15] and prev_array[16]==cur_array[16] and prev_array[17]==cur_array[17] and prev_array[18]==cur_array[18] and prev_array[19]==cur_array[19] and prev_array[20]==cur_array[20] and prev_array[21]==cur_array[21] and prev_array[23]==cur_array[23] and prev_array[24]==cur_array[24] and prev_array[25]==cur_array[25] and prev_array[26]==cur_array[26] and prev_array[27]==cur_array[27] and prev_array[28]==cur_array[28]):
                        fwrite.write(cur)
        prev=cur

fread.close()
fwrite.close()

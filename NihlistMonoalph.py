import math
import numpy as np

####USER INPUTS####
ct = """94 39 55 40 75 58 56 69 84 35 46 47 57 66 56 69 76 55 47 76 57 78 47 70 67 57 47 77 86 47 28 67 87 55 28 68 53 57 27 68 76 38 47 49 53 45 58 56 73 37 47 57 74 48 57 57 57 57 57 68 94 47 24 69 66 56 57 48 66 57 38 49 75 46 47 46 96 58 58 77 76 69 44 39 75 68 35 40 86 68 36 49 85 45 55 59 74 35 46 79 76 68 36 40 84 46 58 79"""
key_length = 4
#Standard 5x5
polybiusGrid = [["a","b","c","d","e"],
                ["f","g","h","i","k"],
                ["l","m","n","o","p"],
                ["q","r","s","t","u"],
                ["v","w","x","y","z"]]

#Standard 6x6
"""polybiusGrid = [["a","b","c","d","e","f"],
                ["g","h","i","j","k","l"],
                ["m","n","o","p","q","r"],
                ["s","t","u","v","w","x"],
                ["y","z","0","1","2","3"],
                ["4","5","6","7","8","9"]]"""

#######################################################



ct = ct.split(" ")
ct_len = len(ct)
grid_size = len(polybiusGrid)

if(grid_size == 5):
    alph = "abcdefghiklmnopqrstuvwxyz"
else:
    alph = "abcdefghijklmnopqrstuvwxyz0123456789"

#Make a lookup table for the provided grid
grid_lookup = {}
for i in range(0, grid_size):
    for j in range(0, grid_size):
        grid_lookup[polybiusGrid[i][j]] = str(i+1) + str(j+1)
    
##Define functions
def fitness(text):  #Calc with chi squared monogram comparison
    text = (text.replace(" ","")).lower()
    alph = "abcdefghijklmnopqrstuvwxyz"
    ocrr = np.zeros(26)
    freq = []
    for i in text:  #Add each letter to a total count array
        if(alph.find(i)!=-1):
            ocrr[alph.find(i)]+=1
    total = sum(ocrr)
    for i in range(0,len(ocrr)):    #Calculate letter percentages
        freq.append(ocrr[int(i)]/total)

    #####CHI SQUARED#####
    expected = [8.13,1.49,2.71,4.32,12.02,2.30,2.03,5.92,7.31,0.10,0.69
                ,3.98,2.61,6.95,7.68,1.82,0.11,6.02,6.28,9.10,2.88,1.11
                ,2.09,0.17,2.11,0.07]
    expected = np.divide(expected,100)
    chi = 0
    for i in range(0,len(freq)):
        chitop = (freq[i]-expected[i])**2
        chibottom= expected[i]
        
        chi+=(chitop/chibottom)
    return chi

##Polybius helpers
def findNumberPolybiusPos(numberin):
    number = str(numberin)
    return polybiusGrid[int(number[0])-1][int(number[1])-1] #-1 to account for 0 based index

def findLetterPolybiusPos(letter, lookup_dict):
    return lookup_dict.get(letter)

#Make an array of n arrays each containing what letters each key letter # is
#responsible for
dependants = []
for i in range(0, key_length):
    dependants.append([])

for i, num in enumerate(ct):
    dependants[i%key_length].append(int(num))



#For each dependant array work out the best key with chi squared
for i in range(0, key_length):
    trial_key_results = []
    key_num = i
    dependant_num = dependants[key_num]

    #Decrypt these with a-z or a-6 depending on grid size and check for the best chi squared score
    for j in range(0,grid_size**2):
        key_letter = alph[j]
        key_number = findLetterPolybiusPos(key_letter, grid_lookup) #Find the letters polybius cordinates
        tmp_ct = ""
        for k in range(0,len(dependant_num)):   #For each ct number subtract this key number + convert to letters
            tmp_pt_num = int(dependant_num[k]) - int(key_number)
            try:
                tmp_ct += findNumberPolybiusPos(tmp_pt_num)
            except:
                #print("Not a valid key cordinate, skipping")
                tmp_ct = ""
                break

        #At this stage we've got the temp ct fully and must find it's chi squared and add both to a list for later
        chi_squared_score = fitness(tmp_ct)
        if(not np.isnan(chi_squared_score)):
            trial_key_results.append([key_letter, chi_squared_score])
            
    #We now print the best result from this
    print(i, min(trial_key_results, key=lambda x: x[1])[0])
    trial_key_results.sort(key=lambda x: x[1])
    print((trial_key_results))
    print("\n")

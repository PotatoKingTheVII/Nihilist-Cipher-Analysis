import math
import numpy as np
import random
import copy

####USER INPUTS####
ct = """84 105 46 78 54 97 28 56 62 63 38 85 85 82 28 56 77 77 61 46 85 117 61 87 55 74 61 77 63 113 69 55 94 77 69 37 43 74 70 37 77 106 61 75 43 62 78 50 57 66 61 40 47 102 47 40 85 74 47 37 84 113 27 56 82 67 47 86 82 74 39 75 54 112 61 35 97 97 78 77 77 114 41 79 54 83 76 78 63 83 77 75 44 62 46 70 47 63 38 90 77 83 77 78 62 112 78 90"""
key_length = 4
grid_size = 6
###################



#Split up our ct and set the appropriate alphabets
ct = ct.split(" ")
ct_len = len(ct)

if(grid_size == 5):
    alph = "abcdefghiklmnopqrstuvwxyz"
else:
    alph = "abcdefghijklmnopqrstuvwxyz0123456789"

##Define functions
##Polybius helpers
def findNumberPolybiusPos(numberin, alphabet):
    number = str(numberin)
    x = int(number[0])-1
    y = int(number[1])-1

    #If we get a negative set it to be an out of grid cord
    #To force an error and account for them
    if(x < 0):
        x=9
    if(y < 0):
        y=9

    return alphabet[x][y] #-1 to account for 0 based index

#Empirically find all possible keys for each key index
def findValidKeys(ct, key_length):
    dependants = []
    for i in range(0, key_length):
        dependants.append([])

    for i, num in enumerate(ct):
        dependants[i%key_length].append(int(num))

    #For each key index work out the letters that are allowed
    allowed_keys_limits = []
    if(grid_size == 5):
        valid_numbers = [11,12,13,14,15,21,22,23,24,25,31,32,33,34,35,41,42,43,44,45,51,52,53,54,55]
    else:
        valid_numbers = [11,12,13,14,15,16,21,22,23,24,25,26,31,32,33,34,35,36,41,42,43,44,45,46,51,52,53,54,55,56,61,62,63,64,65,66]
        
    for dependant in dependants:
        if(grid_size == 5):
            tmp_allowed_dependants = [11,12,13,14,15,21,22,23,24,25,31,32,33,34,35,41,42,43,44,45,51,52,53,54,55]
        else:
            tmp_allowed_dependants = [11,12,13,14,15,16,21,22,23,24,25,26,31,32,33,34,35,36,41,42,43,44,45,46,51,52,53,54,55,56,61,62,63,64,65,66]
            
        for number in dependant:
            i = 0
            for trial_number in valid_numbers:
                pt_number = number - trial_number

                if pt_number not in valid_numbers:  #If this didn't work then remove it from the valid numbers list
                    try:
                        del tmp_allowed_dependants[tmp_allowed_dependants.index(trial_number)]
                    except:
                        pass #I.e. we've already deleted it in the past

        allowed_keys_limits.append(list(dict.fromkeys(tmp_allowed_dependants)))

    return allowed_keys_limits

#Decodes ciphertext with given polybius grid and key
def nihlistDecode(ct, alphabet, key): 
    final_ct = ""
    #For each CT number subtract the key number and convert to letters
    for k in range(0,len(ct)):   #For each ct number subtract this key number + convert to letters
        tmp_pt_num = int(ct[k]) - int(key[k%len(key)])
        try:
            final_ct += findNumberPolybiusPos(tmp_pt_num, alphabet)
        except:
            print("Not a valid key cordinate. If this appears something has gone very wrong")
            break
    return final_ct

#Mutate the input grid
def mutate(polybiusGrid):
    rnd_int = random.randint(0,100)

    #Swap rows {Not used}
    if(111 <= rnd_int <= 111):
        mutated_grid = random.sample(list(polybiusGrid), len(polybiusGrid))
        
    #Swap letters within a row {Not used}
    elif(111 <= rnd_int <= 111):
        rnd_int_2 = random.randint(0,grid_size-1)
        polybiusGrid[rnd_int_2] = random.sample(list(polybiusGrid[rnd_int_2]), len(polybiusGrid[rnd_int_2]))
        mutated_grid = polybiusGrid

    #Main method, swap 2 random letters in the grid
    else:
        r_n1 = random.randint(0,grid_size-1)
        r_n2 = random.randint(0,grid_size-1)
        r_n3 = random.randint(0,grid_size-1)
        r_n4 = random.randint(0,grid_size-1)
        
        while r_n1 == r_n3 and r_n2 == r_n4:    #If we've picked the same cordinate for each loop till we haven't
            r_n1 = random.randint(0,grid_size-1)
            r_n2 = random.randint(0,grid_size-1)
            r_n3 = random.randint(0,grid_size-1)
            r_n4 = random.randint(0,grid_size-1)

        #Select the letters to swap
        letter_a = polybiusGrid[r_n1][r_n2]
        letter_b = polybiusGrid[r_n3][r_n4]

        #Copy the grid for our mutated version and swap the letters
        mutated_grid = copy.deepcopy(polybiusGrid)  #The existence of deepcopy has caused me much pain
        mutated_grid[r_n1][r_n2] = letter_b
        mutated_grid[r_n3][r_n4] = letter_a
    return mutated_grid

#Pick a random key from the allowed list
def randomKey(allowed_index_keys):
    key = []
    for i in range(0,key_length):
        key.append(np.random.choice(allowed_index_keys[i]))
    return key

#Credit to http://practicalcryptography.com/cryptanalysis/text-characterisation/quadgrams/ for the method
def fitnessQuadgram(text, quadGrams, min_val):
    #If our chunk isn't in the list then add this for a minimum
    fitness = 0

    #Loop through the text incrementing one at a time
    #For overlapping quadgrams
    for i in range(0,len(text)-3):
        current_chunk = text[i:i+4]
        if current_chunk in quadGrams:
            fitness+=quadGrams[current_chunk]
        else:
            fitness+= min_val

    return fitness

#Load the expected percentages from a reference file
with open("quadgrams.txt", "r") as fin:
    lines = fin.readlines()
    quadGrams = {}  #Lookup for percentages
    for line in lines:
        content = line.split(" ")
        quadGrams[content[0]] = int(content[1])

    total_count = sum(quadGrams.values())


    #Convert to log10 percentages
    for quadGram in quadGrams.keys():
        quadGrams[quadGram] = math.log10(float(quadGrams[quadGram]/total_count))

    #Calculate minimum value for quads not in our list
    min_val = math.log10(0.01/total_count)



#####################Actual hillclimbing section begins#####################
#Start with the default grids, most likely to work
if(grid_size == 5):
    #Standard 5x5
    polybiusGrid = [["a","b","c","d","e"],
                    ["f","g","h","i","k"],
                    ["l","m","n","o","p"],
                    ["q","r","s","t","u"],
                    ["v","w","x","y","z"]]
else:
    #Standard 6x6
    polybiusGrid = [["a","b","c","d","e","f"],
                    ["g","h","i","j","k","l"],
                    ["m","n","o","p","q","r"],
                    ["s","t","u","v","w","x"],
                    ["y","z","0","1","2","3"],
                    ["4","5","6","7","8","9"]]

#First find which key letters are actually allowed for each key index
allowed_index_keys = findValidKeys(ct, key_length)
print("The header keyspace we are exploring is:", allowed_index_keys)

#Initialize our variables
best_fitness = -1e10
step_count = 0
best_pt = ""
best_grid = []

#Run indefinitely searching for a best pt
while True:
    ##Make a new grid assuming we aren't on the inital attempt
    if(step_count != 0 ):
        polybiusGrid = np.random.choice(list(alph),  size=(grid_size,grid_size), replace = False)

    #Pick a random starting key
    key = randomKey(allowed_index_keys)

    #Reset variables for this next random parent
    best_sub_fitness = -1e10
    best_sub_pt = ""
    best_sub_key = ""
    best_sub_grid = []

    sub_iteration_count = 0
    trialGrid = mutate(polybiusGrid)

    #For this parent grid and key how many iterations should we try to optimize it for?
    while sub_iteration_count < 4000:
        
        #Do we mutate the key or the grid?
        rnd_int = random.randint(0,100)
        
        if(rnd_int < 95):    
            trialGrid = mutate(polybiusGrid) #Mutate the current parent grid  
        else:
            key = randomKey(allowed_index_keys) #Otherwise we pick a new random key
        

        #Find the fitness with the current grid and check if it's better
        #If it is then keep this grid and mutate it, otherwise try another mutation
        c_pt = nihlistDecode(ct, trialGrid, key)
        c_fitness = fitnessQuadgram(c_pt.upper(), quadGrams, min_val)
       
        #If this grid is better then keep it and set it as the new polybius grid parent for this run
        if(c_fitness > best_sub_fitness):
            best_sub_fitness = c_fitness
            polybiusGrid = copy.deepcopy(trialGrid)
            best_sub_pt = c_pt
            best_sub_key = key
            best_sub_grid = copy.deepcopy(trialGrid)
            sub_iteration_count = 0 #Since we improved reset the grace count back to 0
        else:
            sub_iteration_count += 1    #No improvement


    #Check if this overall sub round had a better result than the best so far, if so then set it as the new goal
    if(best_sub_fitness > best_fitness):
        best_pt = best_sub_pt
        best_fitness = best_sub_fitness
        best_key = best_sub_key
        best_grid = copy.deepcopy(best_sub_grid)
        print("\n\n\nBest pt:\n",best_pt, "\nFitness:", best_fitness, "\nBest grid:\n", best_grid, "\nBest key:", best_key)

        step_count+=1



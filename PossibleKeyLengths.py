####User input####
ct = """94 39 55 40 75 58 56 69 84 35 46 47 57 66 56 69 76 55 47 76 57 78 47 70 67 57 47 77 86 47 28 67 87 55 28 68 53 57 27 68 76 38 47 49 53 45 58 56 73 37 47 57 74 48 57 57 57 57 57 68 94 47 24 69 66 56 57 48 66 57 38 49 75 46 47 46 96 58 58 77 76 69 44 39 75 68 35 40 86 68 36 49 85 45 55 59 74 35 46 79 76 68 36 40 84 46 58 79"""
grid_size = 5 #Either 5 or 6

###################


#Split up into each ct letter coordinate
ct = ct.split(" ")
ct_len = len(ct)

#For each key period from 2 to 20
for j in range(2, 20):
    key_length = j

    #Make an array of n arrays, each containing what letter each key letter is responsible for
    dependants = []
    for i in range(0, key_length):
        dependants.append([])

    for i, num in enumerate(ct):
        dependants[i%key_length].append(int(num))


    #For each dependant array work out if any key is valid
    #Doing it logically had issues with 1-off edge cases
    #So bruteforce it empirically
    #For each key index work out the letters that are allowed, if any
    valid = True
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
            for trial_number in valid_numbers:
                pt_number = number - trial_number
                if pt_number not in valid_numbers:  #If this didn't work then remove it from the valid numbers list
                    try:
                        del tmp_allowed_dependants[tmp_allowed_dependants.index(trial_number)]
                    except:
                        pass #I.e. we've already deleted it in the past

        #If no keys at all fit this index then it can't be the correct key period so skip
        if(len(list(dict.fromkeys(tmp_allowed_dependants))) == 0):
            valid = False
            break

        #Else add the valid keys
        allowed_keys_limits.append(list(dict.fromkeys(tmp_allowed_dependants)))

    if(valid):
        print(j, "is a valid key length with possible keys as:", allowed_keys_limits, "\n")

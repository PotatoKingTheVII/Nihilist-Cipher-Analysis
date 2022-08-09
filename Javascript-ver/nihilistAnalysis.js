//Given ciphertext+grid_size writes all valid possible keylengths to output box
function possible_keylengths(ciphertext, grid_size) 
{
	//Check what numbers are valid for this grid size
	if(grid_size == 5)
	{
        valid_numbers = [11,12,13,14,15,21,22,23,24,25,31,32,33,34,35,41,42,43,44,45,51,52,53,54,55];
	}
    else
	{
        valid_numbers = [11,12,13,14,15,16,21,22,23,24,25,26,31,32,33,34,35,36,41,42,43,44,45,46,51,52,53,54,55,56,61,62,63,64,65,66];
	}

	//Split up into each ct letter coordinate
	ct = ciphertext.split(" ");
	ct_len = ct.length;
	
	//For each key period from 2 to 20	
	for (let key_length = 2; key_length <= 20; key_length++)
	{
		//Make an array of n arrays, each containing what letter each key letter is responsible for
		var dependants = [];
		for (let i = 0; i < key_length; i++)	//Initialize empty arrays
		{
			dependants.push([]);
		}
		
		for (let i = 0; i < ct_len; i++)	//Fill them with the numbers they're responsible for, for each index
		{
			dependants[i%key_length].push(parseInt(ct[i]));
		}
		
		//For each dependant array work out if any key is valid
		//Doing it logically had issues with 1-off edge cases
		//So bruteforce it empirically
		//For each key index work out the letters that are allowed, if any
		valid = true
		allowed_keys_limits = []
		for (let dependant of dependants)	//For each key index list of dependant numbers
		{
			if(grid_size == 5)
			{
				tmp_allowed_dependants = [11,12,13,14,15,21,22,23,24,25,31,32,33,34,35,41,42,43,44,45,51,52,53,54,55];
			}
			else
			{
				tmp_allowed_dependants = [11,12,13,14,15,16,21,22,23,24,25,26,31,32,33,34,35,36,41,42,43,44,45,46,51,52,53,54,55,56,61,62,63,64,65,66];
			}
   			
			for (let c_number of dependant)	//For each dependant number itself
			{
				for (let trial_number of valid_numbers)	//Check for all possible key values to see if any are vaid
				{
					var pt_number = c_number - trial_number;
					if (!(valid_numbers.includes(pt_number)))	//If this specific key didn't work remove it from the valid list
					{
						delete tmp_allowed_dependants[tmp_allowed_dependants.indexOf(trial_number)];
					}	
				}
			}
			
			//If no keys at all fit this index then it can't be the correct key period so skip
			if(tmp_allowed_dependants.filter(Boolean).length == 0)
			{
				valid = false;
				break;
			}
			
			//Else add the valid keys
			allowed_keys_limits.push(tmp_allowed_dependants);
		}
	
		//If this key length was valid output it
		if(valid)
		{
			document.getElementById('outputTxt').value = document.getElementById('outputTxt').value + ((key_length) + " valid key length with allowed keys:\n")
			
			//Print the actual allowed keys, one key index at a time
			let i = 1
			for (let allowed_index_keys of allowed_keys_limits)
			{
				let allowed_key_string = allowed_index_keys.join(" ").trim().replaceAll("  ", " ").replaceAll("  ", " ").replaceAll("  ", " ");
				document.getElementById('outputTxt').value = document.getElementById('outputTxt').value + "Key position " + i + ": ";
				document.getElementById('outputTxt').value = document.getElementById('outputTxt').value + allowed_key_string + "\n";
				i++;
			}
			document.getElementById('outputTxt').value = document.getElementById('outputTxt').value + "\n";	//Add newline for next
		}
	}

	//Check if we never output anything, if so alert user that no keys were valid
	if(document.getElementById('outputTxt').value == "")
	{
		document.getElementById('outputTxt').value = document.getElementById('outputTxt').value + "No possible key-lengths for this size of grid";
	}
}


//Uppercase input no spacing for text and calculates a fitness score using the quadgrams table and min value passed
function quadgram_fitness(text, quadGrams, min_value)
{
	var fitness = 0;
	
	//Loop through the text incrementing one at a time
	//for overlapping quadgrams
	for (let i = 0; i < text.length-3; i++)
	{
		var current_chunk = text.substr(i, 4);
		if(current_chunk in quadGrams)
		{
			fitness += quadGrams[current_chunk];
		}
		
		else
		{
			fitness += min_value;
		}
	}
	
	return fitness;
}


//Return a fitness based on single letter frequency analysis
//expects lowercase text without spacing, only alphabetical
function mono_freq_fitness(text)
{
	var alph = "abcdefghijklmnopqrstuvwxyz";
	var ocrr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0];
	var freq = [];
	
	//Add each letter to occurances array
	for (let c_letter of text)
	{
		var index = alph.indexOf(c_letter);
		if(index != -1)
		{
			ocrr[index] += 1;	//If this letter exists then add to array
		}
	}
	var total = ocrr.reduce((pv, cv) => pv + cv, 0);	//Sum up all the occurances

	//Now convert to frequencies
	for (let c_value of ocrr)
	{
		freq.push(c_value / total);
	}
	
	//CHI-Squared section:
	expected = [0.0813, 0.0149, 0.0271, 0.0432, 0.1202, 0.023, 0.0203, 0.0592, 0.0731, 
				0.001, 0.0069, 0.0398, 0.0261, 0.0695, 0.0768, 0.0182, 0.0011, 0.0602,
				0.0628, 0.091, 0.0288, 0.0111, 0.0209, 0.0017, 0.0211, 0.0007];
				
	var chi = 0;
	for (let i = 0; i < freq.length; i++)
	{
		var chitop = (freq[i]-expected[i])**2;
		var chibottom= expected[i];
		chi+=(chitop/chibottom);
	}
	
	return chi;
}

//Given a number returns the char in the provided grid that it represents
function find_number_polybius_pos(number_in, polybiusGrid)
{
	var number_str = number_in.toString();
	var x = parseInt(number_str[0]) - 1
	var y = parseInt(number_str[1]) - 1
	
	//If we get a negative / invalid set it to be an out of bounds cord
	//to force an error to throw later
	if(x < 0) {x = 9; y=9;}
	if(y < 0) {y = 9; x=9;}

	return polybiusGrid[x][y];
}

//Returns grid cordinate number that the given letter represents
function find_letter_polybius_pos(letter, lookup_dict)
{
	return lookup_dict[letter];
}

//Decodes ciphertext with given polybius grid and key(in numeric form [22, 33, 24, ...])
function nihilist_decode(ct, alphabet, key)
{
	var final_ct = "";
	for (let k = 0; k < ct.length; k++)
	{
		var tmp_pt_num = parseInt(ct[k]) - parseInt(key[k%key.length]);
		try	//The tmp pt cordinate might not be valid
		{
			var tmp_pt_result = find_number_polybius_pos(tmp_pt_num, alphabet);
			if(tmp_pt_result === undefined) //Double check to make sure grid cord is valid
			{
				tmp_pt_result = "";
			}

		}
		catch
		{
			tmp_pt_result = "";
		}		
		
		final_ct += tmp_pt_result;
	}

	return final_ct;
}

//Sets output box to list all monoalph keys with their fitness' and the best overall result
function monoalph_solve(ciphertext, polybiusGrid, key_length)
{
	//Get size and format output box start
	var grid_size = polybiusGrid.length;
	document.getElementById('outputTxt').value = document.getElementById('outputTxt').value + "*Analysis Section Top: (Plaintext at bottom)*\n";	

	//Split up into each ct letter coordinate
	var ct = ciphertext.split(" ");
	var ct_len = ct.length;
	
	if(grid_size == 5)
	{
		alph = "abcdefghiklmnopqrstuvwxyz"
	}
	else
	{
		alph = "abcdefghijklmnopqrstuvwxyz0123456789"
	}

	//Make a lookup table for the provided grid
	var grid_lookup = {}
	for (let i = 0; i < grid_size; i++)
	{
		for (let j = 0; j < grid_size; j++)
		{
			var tmp_i = i+1;
			var tmp_j = j+1;
			grid_lookup[polybiusGrid[i][j]] = tmp_i.toString() + tmp_j.toString()
		}
	}
	
	//Make an array of n arrays each containing what letters earch key letter # is responsible for
	var dependants = [];		
	for (let i = 0; i < key_length; i++) 
	{
		dependants.push([]);
	}
	
	for (let i = 0; i < ct_len; i++) 
	{
		dependants[i%key_length].push(parseInt(ct[i]))
	}

	//For each dependant array work out the best key with chi squared
	var best_key = "";
	for (let i = 0; i < key_length; i++) 
	{
		var trial_key_results = [];
		var key_num = i;
		var dependant_num = dependants[key_num];
		
		//Decrypt these with a-z or a-6 depending on grid size and check for the best chi squared score
		for (let j = 0; j < grid_size**2; j++)
		{
			var key_letter = alph[j]
			var key_number = find_letter_polybius_pos(key_letter, grid_lookup) //Find the letters polybius cordinates
			var tmp_ct = ""
			
			for (let k = 0; k <dependant_num.length; k++) //For each ct number subtract this key number + convert to letters
			{
				var tmp_pt_num = parseInt(dependant_num[k]) - parseInt(key_number);
				try	//The tmp pt cordinate might not be valid
				{
					var tmp_pt_result = find_number_polybius_pos(tmp_pt_num, polybiusGrid);
					if(tmp_pt_result === undefined) //Double check to make sure grid cord is valid
					{
						tmp_ct = "";
						break;
					}
					tmp_ct += tmp_pt_result;
				}

				catch
				{
					tmp_ct = "";
					break;
				}
			}
			
			var chi_squared_score = mono_freq_fitness(tmp_ct);
			if(!isNaN(chi_squared_score))
			{
				trial_key_results.push([key_letter, chi_squared_score])	
			}				
		}
		
		//Sort so best chi squared letter is first
		trial_key_results.sort((a, b) => a[1] - b[1])
		
		if(trial_key_results.length == 0)
		{
			document.getElementById('outputTxt').value = document.getElementById('outputTxt').value + "No valid keys of this length";
			return 1
		}
		
		//Output best letter
		document.getElementById('outputTxt').value = document.getElementById('outputTxt').value + "Best " + (i+1) + " index key character: " + trial_key_results[0][0] + "\n";
		document.getElementById('outputTxt').value = document.getElementById('outputTxt').value + "Possible characters with scores:\n";

		//Output all other valid options
		for (let m = 0; m < trial_key_results.length; m++)
		{
			var tmp_output = trial_key_results[m].toString();
			var format_output = tmp_output.trim().replaceAll(",", ": ").substring(0, 8);;
			document.getElementById('outputTxt').value = document.getElementById('outputTxt').value + format_output + "\n";
		}

		document.getElementById('outputTxt').value = document.getElementById('outputTxt').value + "\n";
		best_key += trial_key_results[0][0];
	}

	//Now we want to actually decrypt with the best letter keys and print the key + pt
	//Convert key to grid cordinates for final decode function
	var key_numbers = [];
	for (let n = 0; n < best_key.length; n++)
	{
		key_numbers.push(find_letter_polybius_pos(best_key[n], grid_lookup));
	}

	var final_plaintext = nihilist_decode(ct, polybiusGrid, key_numbers);
	document.getElementById('outputTxt').value = document.getElementById('outputTxt').value + "***Decryption section:***\n";
	document.getElementById('outputTxt').value = document.getElementById('outputTxt').value + "The best key overall was: " + best_key + "\n";
	document.getElementById('outputTxt').value = document.getElementById('outputTxt').value + "For a plaintext of: " + final_plaintext;
}


//Return list of all valid key chars for each index of the provided key length
function find_valid_keys(ct, grid_size, key_length) 
{
	//Set length and appropriate charset
	var ct_len = ct.length;
	if(grid_size == 5)
	{
        valid_numbers = [11,12,13,14,15,21,22,23,24,25,31,32,33,34,35,41,42,43,44,45,51,52,53,54,55];
	}
    else
	{
        valid_numbers = [11,12,13,14,15,16,21,22,23,24,25,26,31,32,33,34,35,36,41,42,43,44,45,46,51,52,53,54,55,56,61,62,63,64,65,66];
	}

	//Make an array of n arrays, each containing what letter each key letter is responsible for
	var dependants = [];
	for (let i = 0; i < key_length; i++)	//Initialize empty arrays
	{
		dependants.push([]);
	}
	
	for (let i = 0; i < ct_len; i++)	//Fill them with the numbers they're responsible for, for each index
	{
		dependants[i%key_length].push(parseInt(ct[i]));
	}
	
	//For each dependant array work out if any key is valid
	//Doing it logically had issues with 1-off edge cases
	//So bruteforce it empirically
	//For each key index work out the letters that are allowed, if any
	allowed_keys_limits = []
	for (let dependant of dependants)	//For each key index list of dependant numbers
	{
		if(grid_size == 5)
		{
			tmp_allowed_dependants = [11,12,13,14,15,21,22,23,24,25,31,32,33,34,35,41,42,43,44,45,51,52,53,54,55];
		}
		else
		{
			tmp_allowed_dependants = [11,12,13,14,15,16,21,22,23,24,25,26,31,32,33,34,35,36,41,42,43,44,45,46,51,52,53,54,55,56,61,62,63,64,65,66];
		}
		
		for (let c_number of dependant)	//For each dependant number itself
		{
			for (let trial_number of valid_numbers)	//Check for all possible key values to see if any are vaid
			{
				var pt_number = c_number - trial_number;
				
				if (!(valid_numbers.includes(pt_number)))	//If this specific key didn't work remove it from the valid list
				{
					
					//Remove that element with splice
					var index = tmp_allowed_dependants.indexOf(trial_number)
					if(index > - 1)
					{
						tmp_allowed_dependants.splice(index, 1)
					}
				}	
			}
		}
		
		//Else add the valid keys
		allowed_keys_limits.push(tmp_allowed_dependants);
	}
	return allowed_keys_limits;
}

//Return a random key from the provided allowed index chars
function random_key(key_list)
{
	key = [];
	//For each key index choose a random value
	for (let i = 0; i < key_list.length; i++)
	{
		key.push(key_list[i][ Math.floor(Math.random() * key_list[i].length)]);
		
	}
	
	return key;
}

//From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(min, max) 
{
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

//Mutate input polybius grid by swapping 2 random values
function mutate_grid(polybiusGrid)
{
	var r_n1 = getRandomInt(0, polybiusGrid.length);
	var r_n2 = getRandomInt(0, polybiusGrid.length);
	var r_n3 = getRandomInt(0, polybiusGrid.length);
	var r_n4 = getRandomInt(0, polybiusGrid.length);
	
	while(r_n1 == r_n3 & r_n2 == r_n4) //If we've picked the same cordinate for each loop till we haven't
	{
		var r_n1 = getRandomInt(0, polybiusGrid.length);
		var r_n2 = getRandomInt(0, polybiusGrid.length);
		var r_n3 = getRandomInt(0, polybiusGrid.length);
		var r_n4 = getRandomInt(0, polybiusGrid.length);
	}
	 
	//Select the letters to swap
	var letter_a = polybiusGrid[r_n1][r_n2];
	var letter_b = polybiusGrid[r_n3][r_n4];

	//Copy the grid for our mutated version and swap the letters
	var mutated_grid = structuredClone(polybiusGrid);
	mutated_grid[r_n1][r_n2] = letter_b;
	mutated_grid[r_n3][r_n4] = letter_a;

	return mutated_grid;
}



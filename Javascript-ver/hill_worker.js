importScripts('nihilistAnalysis.js'); //Load all our nihilist functions

//Hill climb the provided ciphertext with the grid up till the iteration limit. Report best results back to main
function hill_climb(ciphertext, polybiusGrid, key_size, quadgram_table, quadgram_min_value, hill_fix_grid, hill_iteration_limit)
{
	//First format the ciphertext and find the allowed keys
	var ct = ciphertext.split(" ");
	var grid_size = polybiusGrid.length;
	
	//What charset should we use?
	if(grid_size == 5)
	{
		alph = "abcdefghiklmnopqrstuvwxyz";
	}
	else
	{
		alph = "abcdefghijklmnopqrstuvwxyz0123456789";
	}
	var allowed_index_keys = find_valid_keys(ct, grid_size, key_size);

	//Initialize the hill climbing variables
	var best_fitness = -1e10;
	var step_count = 0;
	var best_pt = "";
	var best_grid = [];
	
	//Main hill-climbing loop. Note hill_fix_grid is checked throughout to check if we should only climb the vig key and not the grid
	//A random grid is generated and mutated alongside keys until it doesn't improve any longer. Then we try with a new random grid.
	//Also note structuredClone is used often to make sure any new grids don't accidently change their old parents
	while (step_count < hill_iteration_limit)
	{
		//Should we report progress back to main?
		if(step_count % Math.floor(hill_iteration_limit/10) == 0)
		{
			self.postMessage([1, ((step_count+1)/hill_iteration_limit) + Math.floor(hill_iteration_limit/10)/hill_iteration_limit])	//Overestimates a bit but accounts for edge cases near 90%
		}
		
		//If we aren't on the inital attempt then make a new grid. Checked because
		//The original grid is likely to be the actual one used.
		//Also just use the original grid if we're only searching in the key-space
		if(step_count != 0 & hill_fix_grid == false)
		{
			//We first shuffle the alphabet and convert to the expected grid array*array format
			var shuffled_alph = alph.split('').sort(function(){return 0.5-Math.random()}).join(''); //not uniform dist but good enough
			//Convert the grid to our array format. I miss numpy
			for (let i = 0; i < grid_size**2; i++)
			{
				var col = i % grid_size;
				var row = Math.floor(i/grid_size);
				var letter = shuffled_alph[i];
				polybiusGrid[row][col] = letter;
			}
		}
		
		//Pick a random starting key
		var key = random_key(allowed_index_keys);
		
		//Reset variables for this next random parent
		var best_sub_fitness = -1e10;
		var best_sub_pt = "";
		var best_sub_key = "";
		var best_sub_grid = [];

		var sub_iteration_count = 0;
		if( hill_fix_grid == false)
		{
			var trialGrid = mutate_grid(polybiusGrid);
		}
		else
		{
			var trialGrid = structuredClone(polybiusGrid);
		}
		
		//#For this parent grid and key how many iterations should we try to optimize it for? 4000 looks to work well enough
		while(sub_iteration_count < 4000)
		{
			//Do we mutate the key or grid? 5% chance to explore key-space
			var rnd_int = Math.random(0,101)
			
			if(rnd_int < 95 & hill_fix_grid == false)
			{
				trialGrid = mutate_grid(polybiusGrid);
			}
			else
			{
				key = random_key(allowed_index_keys);
			}
			
			//Find the fitness with the current grid and check if it's better
			//If it is then keep this grid and mutate it, otherwise try another mutation
			var c_pt = nihilist_decode(ct, trialGrid, key); 
			var c_fitness = quadgram_fitness(c_pt.toUpperCase(), quadgram_table, quadgram_min_value);

			//If this grid is better then keep it and set it as the new polybius grid parent for this run
			if(c_fitness > best_sub_fitness)
			{
				best_sub_fitness = c_fitness;
				polybiusGrid = structuredClone(trialGrid);
				best_sub_pt = c_pt;
				best_sub_key = key;
				best_sub_grid = structuredClone(trialGrid);
				sub_iteration_count = 0; //Since we improved reset the grace count back to 0
			}
			else
			{
				sub_iteration_count += 1;    //No improvement			
			}
		}
		
		//Check if this overall sub round had a better result than the best so far, if so then set it as the new goal
		if(best_sub_fitness > best_fitness)
		{
			best_pt = best_sub_pt;
			best_fitness = best_sub_fitness;
			best_key = best_sub_key;
			best_grid = structuredClone(best_sub_grid);
			self.postMessage([0, best_pt, best_fitness, best_key, best_grid])	//Send this new best result back to main
		}
		step_count+=1	//No improvement so increase step count
	}
	
	//Outside of hill climbing loop
}

//Worker called, unpack event data for arguments
onmessage = function(event)
{
		var ciphertext = event.data[0];
		var polybiusGrid = event.data[1];
		var key_size = event.data[2];
		var quadgram_table = event.data[3];
		var quad_min_value = event.data[4];
		var hill_fix_grid = event.data[5];
		var hill_iteration_limit = event.data[6];
		
		//Call the hillclimbing function passing the arguments from above
		hill_climb(ciphertext, polybiusGrid, key_size, quadgram_table, quad_min_value, hill_fix_grid, hill_iteration_limit);
	
		self.close();	//We've finished the search, close the worker
}
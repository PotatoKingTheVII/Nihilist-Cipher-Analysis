## File breakdown
**PossibleKeyLengths**:

Prints all the valid (addition not grid) key periods. Done by grouping the ciphertext into sections which each key position would be responsible for e.g. helloworld with a 3 length key would have the first key letter be responsible for "hlod" and so on. Then for each of these ct letters we can check if any possible key value would result in a plaintext value that's valid on the Polybius grid i.e. 11 but not 10 etc. If a key length has possible letters for all of its key positions then that key length is valid and will be printed along with those valid key letters. However, this works entirely in the numerical space and never actually converts those numbers into letters, a more generic approach such that the actual layout of the Polybius grid doesn't matter, and you can convert the provided numbers to letters with whatever grid after the fact. Initially I had used a logical approach for finding valid keys but frequently ran into rare edge case scenarios which would be off by one so the provided approach simply tries every key, one by one in a bruteforce fashion to check which are valid, probably not suitable if you're calling it often but fine for this once off

**NihlistMonoalph (Requires known Polybius grid)**:

A similar approach to solving vigenère. Both the possible key lengths and actual keys for each position can be found with the above method. Each key position is treated independently. For example with the same "helloworld" with a 3 length key where the first key letter is responsible for "hlod" let us suppose that "a, d, e" were the only possible keys for that position. We would then decode "hlod" with a, d, and e and pick the best result, scoring them by their monogram frequencies. This is then done for the second and third key positions and the best keys printed for each position.

## TODO:

Hill climbing approach will be added soon, allowing solving of both an unknown grid and key at the same time

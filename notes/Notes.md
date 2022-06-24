Notes


Input from user:
    Array of values that change based on Input
    [0,0,0,0,0] each with a + and - button to scroll through n options
    
    NFT has a [level] which limits the options available


    Arguments: 
        Level: String  
        Input Array of numbers:
            Each is an offset from the default of zeros: 

    Render: 
        for each layer in input array:
            render(value, level, layer)

    On render(value, level, layer):
        switch(level){
            case level == level_0:
                levels = { level0[layer]}
            case level == level_1:
                levels = {level0[layer], level1[layer]} 
        }
        





Output:
    Rendering of multiple layers based upon input array





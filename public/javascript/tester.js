const filedata =
    [
        {
            "path": "public/data/YYYY-MM-DD_TT-TT-TT_Longname_number1",
            "name": "YYYY-MM-DD_TT-TT-TT_Longname_number1",
            "children": [
                {
                    "path": "public/data/YYYY-MM-DD_TT-TT-TT_Longname_number1/original-data-structure-errors.json",
                    "name": "original-data-structure-errors.json",
                    "size": 20389,
                    "extension": ".json",
                    "type": "file"
                }
            ],
            "size": 20389,
            "type": "directory"
        },
        {
            "path": "public/data/YYYY-MM-DD_TT-TT-TT_Longname_number2",
            "name": "YYYY-MM-DD_TT-TT-TT_Longname_number2",
            "children": [
                {
                    "path": "public/data/YYYY-MM-DD_TT-TT-TT_Longname_number2/original-data-structure-errors.json",
                    "name": "original-data-structure-errors.json",
                    "size": 20377,
                    "extension": ".json",
                    "type": "file"
                }
            ],
            "size": 20377,
            "type": "directory"
        },
        {
            "path": "public/data/YYYY-MM-DD_TT-TT-TT_Longname_number3",
            "name": "YYYY-MM-DD_TT-TT-TT_Longname_number3",
            "children": [
                {
                    "path": "public/data/YYYY-MM-DD_TT-TT-TT_Longname_number3/original-data-structure-errors.json",
                    "name": "original-data-structure-errors.json",
                    "size": 3130,
                    "extension": ".json",
                    "type": "file"
                }
            ],
            "size": 3130,
            "type": "directory"
        },
        {
            "path": "public/data/YYYY-MM-DD_TT-TT-TT_Longname_number4",
            "name": "YYYY-MM-DD_TT-TT-TT_Longname_number4",
            "children": [
                {
                    "path": "public/data/YYYY-MM-DD_TT-TT-TT_Longname_number4/original-data-structure-errors.json",
                    "name": "original-data-structure-errors.json",
                    "size": 6005,
                    "extension": ".json",
                    "type": "file"
                }
            ],
            "size": 6005,
            "type": "directory"
        },
        {
            "path": "public/data/refname",
            "name": "refname",
            "children": [
                {
                    "path": "public/data/refname/YYYY-MM-DD_TT-TT-TT_Longname_number5",
                    "name": "YYYY-MM-DD_TT-TT-TT_Longname_number5",
                    "children": [
                        {
                            "path": "public/data/refname/YYYY-MM-DD_TT-TT-TT_Longname_number5/original-data-structure-errors.json",
                            "name": "original-data-structure-errors.json",
                            "size": 6076,
                            "extension": ".json",
                            "type": "file"
                        }
                    ],
                    "size": 6076,
                    "type": "directory"
                },
                {
                    "path": "public/data/refname/test.txt",
                    "name": "test.txt",
                    "size": 0,
                    "extension": ".txt",
                    "type": "file"
                }
            ],
            "size": 6076,
            "type": "directory"
        }
    ]

var new_world = []


// vill få med ...

// om type?..borde ja ens ta med det?? eller skitaa i  det..

// vill ha med namnet..


for (var key in filedata)
{
    if (!filedata.hasOwnProperty(key))
        continue;       // skip this property
    if (key == "type")
    {
        console.log("ok")

    }
    // do something...
}


const iterate = (obj) => {
    Object.keys(obj).forEach(key => {

        if ( obj[key] === 'name' )
        {

        }


        if ( obj[key] === 'directory' )
        {
            // spara som ROOT node
            // console.log('key: '+ key + ', value: '+obj[key]);
            new_world.push({
                text: obj[key],
                children : []
            });
        }


        // här bord

        if (typeof obj[key] === 'object') {
            iterate(obj[key])
        }
    })
}

//iterate(filedata);

//console.log(new_world)


// This function handles arrays and objects
function eachRecursive(obj)
{
    for (var k in obj)
    {
        if (typeof obj[k] == "object" && obj[k] !== null)
            eachRecursive(obj[k]);
        else{


            if (obj[k] === "name")
            {
                console.log( obj[k])
            }
        }
        // do something...

    }
}

eachRecursive(filedata)

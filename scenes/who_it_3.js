//
//  PM2.5 levels based on WHO  Interim target-3 levels
//
//  URL: http://apps.who.int/iris/bitstream/handle/10665/69477/WHO_SDE_PHE_OEH_06.02_eng.pdf;jsessionid=6B6F28C00DE45A13540CFF7D37A8FDDC?sequence=1
//

var scene = [
                {
                "name": "off",
                "level": 0,
                "hysteresis_level":     0,
                "favoritelevel":        0,
                "mode":                 "idle"
                },
                {
                "name": "moderate",
                "level": 15,
                "hysteresis_level":     10,
                "favoritelevel":        8,
                "mode":                 "favorite"
        },
        {
                "name": "high",
                "level": 37,
                "hysteresis_level":     6,
                "favoritelevel":        16,
                "mode":                 "favorite"
        }
];


exports.WHO_Interim_Target_3_Scene = scene;

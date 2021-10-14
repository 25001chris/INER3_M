var SpatialReference = new function()
{
	var _NS_ = this;
	var TRANSes = 
	{
		"GCS_Adindan": [
			{usage:"BurkinaFaso", dx:-118.0, dy:-14.0, dz:218.0},
			{usage:"Cameroon", dx:-134.0, dy:-2.0, dz:210.0},
			{usage:"Ethiopia", dx:-165.0, dy:-11.0, dz:206.0},
			{usage:"Mali", dx:-123.0, dy:-20.0, dz:220.0},
			{usage:"MEAN FOR Ethiopia; Sudan", dx:-166.0, dy:-15.0, dz:204.0},
			{usage:"Senegal", dx:-128.0, dy:-18.0, dz:224.0},
			{usage:"Sudan", dx:-161.0, dy:-14.0, dz:205.0}],
		"GCS_Afgooye": {usage:"Somalia", dx:-43.0, dy:-163.0, dz:45.0},
		"GCS_Ain_el_Abd_1970": [
			{usage:"Bahrain", dx:-150.0, dy:-250.0, dz:-1.0},
			{usage:"Saudi Arabia", dx:-143.0, dy:-236.0, dz:7.0}],
		"GCS_American_Samoa_1962": {usage:"American Samoa Islands", dx:-115.0, dy:118.0, dz:426.0},
		"GCS_Anna_1_Astro_1965": {usage:"Cocos Islands", dx:-491.0, dy:-22.0, dz:435.0},
		"GCS_Antigua_Island_Astro_1943": {usage:"Antigua (Leeward Islands)", dx:-270.0, dy:13.0, dz:62.0},
		"GCS_Arc_1950": [
			{usage:"Botswana", dx:-138.0, dy:-105.0, dz:-289.0},
			{usage:"Burundi", dx:-153.0, dy:-5.0, dz:-292.0},
			{usage:"Lesotho", dx:-125.0, dy:-108.0, dz:-295.0},
			{usage:"Malawi", dx:-161.0, dy:-73.0, dz:-317.0},
			{usage:"MEAN FOR Botswana; Lesotho; Malawi; Swaziland; Zaire; Zambia; Zimbabwe", dx:-143.0, dy:-90.0, dz:-294.0},
			{usage:"Swaziland", dx:-134.0, dy:-105.0, dz:-295.0},
			{usage:"Zaire", dx:-169.0, dy:-19.0, dz:-278.0},
			{usage:"Zambia", dx:-147.0, dy:-74.0, dz:-283.0},
			{usage:"Zimbabwe", dx:-142.0, dy:-96.0, dz:-293.0},
			{usage:"MEAN FOR Kenya; Tanzania", dx:-160.0, dy:-6.0, dz:-302.0},
			{usage:"Kenya", dx:-157.0, dy:-2.0, dz:-299.0},
			{usage:"Taanzania", dx:-175.0, dy:-23.0, dz:-303.0}],
		"GCS_Ascension_Island_1958": {usage:"Ascension Island", dx:-205.0, dy:107.0, dz:53.0},
		"GCS_Astro_Beacon_E_1945": {usage:"Iwo Jima", dx:145.0, dy:75.0, dz:-272.0},
		"GCS_Astro_DOS_71_4": {usage:"St Helena Island", dx:-320.0, dy:550.0, dz:-494.0},
		"GCS_Astro_Tern_Island_FRIG_1961": {usage:"Tern Island", dx:114.0, dy:-116.0, dz:-333.0},
		"GCS_Astronomical_Station_1952": {usage:"Marcus Island", dx:124.0, dy:-234.0, dz:-25.0},
		"GCS_Australian_Geodetic_1966": {usage:"Australia; Tasmania", dx:-133.0, dy:-48.0, dz:148.0},
		"GCS_Australian_Geodetic_1984": {usage:"Australia; Tasmania", dx:-134.0, dy:-48.0, dz:149.0},
		"GCS_Ayabelle_Lighthouse": {usage:"Djibouti", dx:-79.0, dy:-129.0, dz:145.0},
		"GCS_Bellevue_IGN": {usage:"Efate &amp; Erromango Islands", dx:-127.0, dy:-769.0, dz:472.0},
		"GCS_Bermuda_1957": {usage:"Bermuda", dx:-73.0, dy:213.0, dz:296.0},
		"GCS_Bissau": {usage:"Guinea-Bissau", dx:-173.0, dy:253.0, dz:27.0},
		"GCS_Bogota_Observatory": {usage:"Colombia", dx:307.0, dy:304.0, dz:-318.0},
		"GCS_Bukit_Rimpah": {usage:"Indonesia (Bangka &amp; Belitung Ids)", dx:-384.0, dy:664.0, dz:-48.0},
		"GCS_Camp_Area_Astro": {usage:"Antarctica (McMurdo Camp Area)", dx:-104, dy:-129, dz:239},
		"GCS_Campo_Inchauspe": {usage:"Argentina", dx:-148, dy:136, dz:90},
		"GCS_Canton_Astro_1966": {usage:"Phoenix Islands", dx:298, dy:-304, dz:-375},
		"GCS_Cape": {usage:"South Africa", dx:-136, dy:-108, dz:-292},
		"GCS_Cape_Canaveral": {usage:"Bahamas; Florida", dx:-2, dy:151, dz:181},
		"GCS_Carthage": {usage:"Tunisia", dx:-263, dy:6, dz:431},
		"GCS_Chatham_Island_Astro_1971": [
			{usage:"New Zealand (Chatham Island)", dx:175, dy:-38, dz:113},
			{usage:"Paraguay", dx:-134, dy:229, dz:-29}],
		"GCS_Corrego_Alegre": {usage:"Brazil", dx:-206, dy:172, dz:-6},
		"GCS_Dabola": {usage:"Guinea", dx:-83, dy:37, dz:124},
		"GCS_Deception_Island": {usage:"Deception Island; Antarctia", dx:260, dy:12, dz:-147},
		"GCS_Djakarta_Batavia": {usage:"Indonesia (Sumatra)", dx:-377, dy:681, dz:-50},
		"GCS_DOS_1968": {usage:"New Georgia Islands (Gizo Island)", dx:230, dy:-199, dz:-752},
		"GCS_Easter_Island_1967": {usage:"Easter Island", dx:211, dy:147, dz:111},
		"GCS_Estonia_1937": {usage:"Estonia", dx:374, dy:150, dz:588},
		"GCS_European_1950": [
			{usage:"Cyprus", dx:-104, dy:-101, dz:-140},
			{usage:"Egypt", dx:-130, dy:-117, dz:-151},
			{usage:"England; Channel Islands; Scotland; Shetland Islands", dx:-86, dy:-96, dz:-120},
			{usage:"England; Ireland; Scotland; Shetland Islands", dx:-86, dy:-96, dz:-120},
			{usage:"Finland; Norway", dx:-87, dy:-95, dz:-120},
			{usage:"Greece", dx:-84, dy:-95, dz:-130},
			{usage:"Iran", dx:-117, dy:-132, dz:-164},
			{usage:"Italy (Sardinia)", dx:-97, dy:-103, dz:-120},
			{usage:"Italy (Sicily)", dx:-97, dy:-88, dz:-135},
			{usage:"Malta", dx:-107, dy:-88, dz:-149},
			{usage:"MEAN FOR Austria; Belgium; Denmark; Finland; France; W Germany; Gibraltar; Greece; Italy; Luxembourg; Netherlands; Norway; Portugal; Spain; Sweden; Switzerland", dx:-87, dy:-98, dz:-121},
			{usage:"MEAN FOR Austria; Denmark; France; W Germany; Netherlands; Switzerland", dx:-87, dy:-96, dz:-120},
			{usage:"MEAN FOR Iraq; Israel; Jordan; Lebanon; Kuwait; Saudi Arabia; Syria", dx:-103, dy:-106, dz:-141},
			{usage:"Portugal; Spain", dx:-84, dy:-107, dz:-120},
			{usage:"Tunisia", dx:-112, dy:-77, dz:-145}],
		"GCS_European_1979": {usage:"MEAN FOR Austria; Finland; Netherlands; Norway; Spain; Sweden; Switzerland", dx:-86, dy:-98, dz:-119},
		"GCS_Fort_Thomas_1955": {usage:"Nevis; St. Kitts (Leeward Islands)", dx:-7, dy:215, dz:225},
		"GCS_Gan_1970": {usage:"Republic of Maldives", dx:-133, dy:-321, dz:50},
		"GCS_Geodetic_Datum_1949": {usage:"New Zealand", dx:84, dy:-22, dz:209},
		"GCS_Graciosa_Base_SW_1948": {usage:"Azores (Faial; Graciosa; Pico; Sao Jorge; Terceira)", dx:-104, dy:167, dz:-38},
		"GCS_Guam_1963": {usage:"Guam", dx:-100, dy:-248, dz:259},
		"GCS_Gunung_Segara": {usage:"Indonesia (Kalimantan)", dx:-403, dy:684, dz:41},
		"GCS_GUX_1_Astro": {usage:"Guadalcanal Island", dx:252, dy:-209, dz:-751},
		"GCS_Herat_North": {usage:"Afghanistan", dx:-333, dy:-222, dz:114},
		"GCS_Hermannskogel_Datum": {usage:"Croatia -Serbia; Bosnia-Herzegovina", dx:653, dy:-212, dz:449},
		"GCS_Hjorsey_1955": {usage:"Iceland", dx:-73, dy:46, dz:-86},
		"GCS_Hong_Kong_1963": {usage:"Hong Kong", dx:-156, dy:-271, dz:-189},
		"GCS_HuTzuShan": {usage:"Taiwan", dx:-637, dy:-549, dz:-203},
		"GCS_Indian": [
			{usage:"Bangladesh", dx:282, dy:726, dz:254},
			{usage:"India; Nepal", dx:295, dy:736, dz:257},
			{usage:"Pakistan", dx:283, dy:682, dz:231}],
		"GCS_Indian_1954": {usage:"Thailand", dx:217, dy:823, dz:299},
		"GCS_Indian_1960": [
			{usage:"Vietnam (Con Son Island)", dx:182, dy:915, dz:344},
			{usage:"Vietnam (Near 16N)", dx:198, dy:881, dz:317}],
		"GCS_Indian_1975": {usage:"Thailand", dx:210, dy:814, dz:289},
		"GCS_Indonesian_1974": {usage:"Indonesia", dx:-24, dy:-15, dz:5},
		"GCS_Ireland_1965": {usage:"Ireland", dx:506, dy:-122, dz:611},
		"GCS_ISTS_061_Astro_1968": {usage:"South Georgia Islands", dx:-794, dy:119, dz:-298},
		"GCS_ISTS_073_Astro_1969": {usage:"Diego Garcia", dx:208, dy:-435, dz:-229},
		"GCS_Johnston_Island_1961": {usage:"Johnston Island", dx:189, dy:-79, dz:-202},
		"GCS_Kandawala": {usage:"Sri Lanka", dx:-97, dy:787, dz:86},
		"GCS_Kerguelen_Island_1949": {usage:"Kerguelen Island", dx:145, dy:-187, dz:103},
		"GCS_Kertau": {usage:"West Malaysia &amp; Singapore", dx:-11, dy:851, dz:5},
		"GCS_Korean_Geodetic_System": {usage:"South Korea", dx:0, dy:0, dz:0},
		"GCS_Kusaie_Astro_1951": {usage:"Caroline Islands", dx:647, dy:1777, dz:-1124},
		"GCS_LC5_Astro_1961": {usage:"Cayman Brac Island", dx:42, dy:124, dz:147},
		"GCS_Leigon": {usage:"Ghana", dx:-130, dy:29, dz:364},
		"GCS_Liberia_1964": {usage:"Liberia", dx:-90, dy:40, dz:88},
		"GCS_Luzon": [
			{usage:"Philippines (Excluding Mindanao)", dx:-133, dy:-77, dz:-51},
			{usage:"Philippines (Mindanao)", dx:-133, dy:-79, dz:-72}],
		"GCS_MPoraloko": {usage:"Gabon", dx:-74, dy:-130, dz:42},
		"GCS_Mahe_1971": {usage:"Mahe Island", dx:41, dy:-220, dz:-134},
		"GCS_Massawa": {usage:"Ethiopia (Eritrea)", dx:639, dy:405, dz:60},
		"GCS_Merchich": {usage:"Morocco", dx:31, dy:146, dz:47},
		"GCS_Midway_Astro_1961": {usage:"Midway Islands", dx:912, dy:-58, dz:1227},
		"GCS_Minna": [
			{usage:"Cameroon", dx:-81, dy:-84, dz:115},
			{usage:"Nigeria", dx:-92, dy:-93, dz:122}],
		"GCS_Monte_Mario": {usage:"Italy", dx:-225, dy:-65, dz:9},
		"GCS_Montserrat_Island_Astro_1958": {usage:"Montserrat (Leeward Islands)", dx:174, dy:359, dz:365},
		"GCS_Nahrwan": [
			{usage:"Oman (Masirah Island)", dx:-247, dy:-148, dz:369},
			{usage:"Saudi Arabia", dx:-243, dy:-192, dz:477},
			{usage:"United Arab Emirates", dx:-249, dy:-156, dz:381}],
		"GCS_Naparima_BWI": {usage:"Trinidad &amp; Tobago", dx:-10, dy:375, dz:165},
		"GCS_North_American_1927": [
			{usage:"Alaska (Excluding Aleutian Ids)", dx:-5, dy:135, dz:172},
			{usage:"Alaska (Aleutian Ids East of 180W)", dx:-2, dy:152, dz:149},
			{usage:"Alaska (Aleutian Ids West of 180W)", dx:2, dy:204, dz:105},
			{usage:"Bahamas (Except San Salvador Id)", dx:-4, dy:154, dz:178},
			{usage:"Bahamas (San Salvador Island)", dx:1, dy:140, dz:165},
			{usage:"Canada (Alberta; British Columbia)", dx:-7, dy:162, dz:188},
			{usage:"Canada (Manitoba; Ontario)", dx:-9, dy:157, dz:184},
			{usage:"Canada (New Brunswick; Newfoundland; Nova Scotia; Quebec)", dx:-22, dy:160, dz:190},
			{usage:"Canada (Northwest Territories; Saskatchewan)", dx:4, dy:159, dz:188},
			{usage:"Canada (Yukon)", dx:-7, dy:139, dz:181},
			{usage:"Canal Zone", dx:0, dy:125, dz:201},
			{usage:"Cuba", dx:-9, dy:152, dz:178},
			{usage:"Greenland (Hayes Peninsula)", dx:11, dy:114, dz:195},
			{usage:"MEAN FOR Antigua; Barbados; Barbuda; Caicos Islands; Cuba; Dominican Republic; Grand Cayman; Jamaica; Turks Islands", dx:-3, dy:142, dz:183},
			{usage:"MEAN FOR Belize; Costa Rica; El Salvador; Guatemala; Honduras; Nicaragua", dx:0, dy:125, dz:194},
			{usage:"MEAN FOR Canada", dx:-10, dy:158, dz:187},
			{usage:"MEAN FOR CONUS", dx:-8, dy:160, dz:176},
			{usage:"MEAN FOR CONUS (East of Mississippi; River Including Louisiana; Missouri; Minnesota)", dx:-9, dy:161, dz:179},
			{usage:"MEAN FOR CONUS (West of Mississippi; River Excluding Louisiana; Minnesota; Missouri)", dx:-8, dy:159, dz:175},
			{usage:"Mexico", dx:-12, dy:130, dz:190}],
		"GCS_North_American_1983": [
			{usage:"Alaska (Excluding Aleutian Ids)", dx:0, dy:0, dz:0},
			{usage:"Aleutian Ids", dx:-2, dy:0, dz:4},
			{usage:"Canada", dx:0, dy:0, dz:0},
			{usage:"CONUS", dx:0, dy:0, dz:0},
			{usage:"Hawaii", dx:1, dy:1, dz:-1},
			{usage:"Mexico; Central America", dx:0, dy:0, dz:0}],
		"GCS_North_Sahara_1959": {usage:"Algeria", dx:-186, dy:-93, dz:310},
		"GCS_NTF_Paris": {usage:"Paris", dx:-168, dy:-60, dz:320},
		"GCS_Observatorio_Meteorologico_1939": {usage:"Azores (Corvo &amp; Flores Islands)", dx:-425, dy:-169, dz:81},
		"GCS_Old_Egyptian_1907": {usage:"Egypt", dx:-130, dy:110, dz:-13},
		"GCS_Old_Hawaiian": [
			{usage:"Hawaii", dx:89, dy:-279, dz:-183},
			{usage:"Kauai", dx:45, dy:-290, dz:-172},
			{usage:"Maui", dx:65, dy:-290, dz:-190},
			{usage:"MEAN FOR Hawaii; Kauai; Maui; Oahu", dx:61, dy:-285, dz:-181},
			{usage:"Oahu", dx:58, dy:-283, dz:-182}],
		"GCS_Oman": {usage:"Oman", dx:-346, dy:-1, dz:224},
		"GCS_Ordnance_Survey_Great_Britain_1936": [
			{usage:"England", dx:371, dy:-112, dz:434},
			{usage:"England; Isle of Man; Wales", dx:371, dy:-111, dz:434},
			{usage:"MEAN FOR England; Isle of Man; Scotland; Shetland Islands; Wales", dx:375, dy:-111, dz:431},
			{usage:"Scotland; Shetland Islands", dx:384, dy:-111, dz:425},
			{usage:"Wales", dx:370, dy:-108, dz:434}],
		"GCS_OSGB_1936": {usage:"British", dx:446.448, dy:-125.157, dz:542.06, rx:0.00000072722052166430399038487115353692, ry:0.000001197489792340553904167087832824, rz:0.0000040821311949422930660270767418539, sf:-0.000020489},
		"GCS_Pico_de_las_Nieves": {usage:"Canary Islands", dx:-307, dy:-92, dz:127},
		"GCS_Pitcairn_Astro_1967": {usage:"Pitcairn Island", dx:185, dy:165, dz:42},
		"GCS_Point_58": {usage:"MEAN FOR Burkina Faso &amp; Niger", dx:-106, dy:-129, dz:165},
		"GCS_Pointe_Noire_1948": {usage:"Congo", dx:-148, dy:51, dz:-291},
		"GCS_Porto_Santo_1936": {usage:"Porto Santo; Madeira Islands", dx:-499, dy:-249, dz:314},
		"GCS_Provisional_South_American_1956": [
			{usage:"Bolivia", dx:-270, dy:188, dz:-388},
			{usage:"Chile (Northern; Near 19S)", dx:-270, dy:183, dz:-390},
			{usage:"Chile (Southern; Near 43S)", dx:-305, dy:243, dz:-442},
			{usage:"Colombia", dx:-282, dy:169, dz:-371},
			{usage:"Ecuador", dx:-278, dy:171, dz:-367},
			{usage:"Guyana", dx:-298, dy:159, dz:-369},
			{usage:"MEAN FOR Bolivia; Chile; Colombia; Ecuador; Guyana; Peru; Venezuela", dx:-288, dy:175, dz:-376},
			{usage:"Peru", dx:-279, dy:175, dz:-379},
			{usage:"Venezuela", dx:-295, dy:173, dz:-371}],
		"GCS_Provisional_South_Chilean_1963": {usage:"Chile (Near 53S) (Hito XVIII)", dx:16, dy:196, dz:93},
		"GCS_Puerto_Rico": {usage:"Puerto Rico; Virgin Islands", dx:11, dy:72, dz:-101},
		"GCS_Pulkovo_1942": {usage:"Russia", dx:28, dy:-130, dz:-95},
		"GCS_Qatar_National": {usage:"Qatar", dx:-128, dy:-283, dz:22},
		"GCS_Qornoq": {usage:"Greenland (South)", dx:164, dy:138, dz:-189},
		"GCS_Reunion": {usage:"Mascarene Islands", dx:94, dy:-948, dz:-1262},
		"GCS_Rome_1940": {usage:"Italy (Sardinia)", dx:-225, dy:-65, dz:9},
		"GCS_S42_Pulkovo_1942": [
			{usage:"Hungary", dx:28, dy:-121, dz:-77},
			{usage:"Poland", dx:23, dy:-124, dz:-82},
			{usage:"Czechoslavakia", dx:26, dy:-121, dz:-78},
			{usage:"Latvia", dx:24, dy:-124, dz:-82},
			{usage:"Kazakhstan", dx:15, dy:-130, dz:-84},
			{usage:"Albania", dx:24, dy:-130, dz:-92},
			{usage:"Romania", dx:28, dy:-121, dz:-77}],
		"GCS_SJTSK": {usage:"Czechoslavakia (Prior 1 JAN 1993)", dx:589, dy:76, dz:480},
		"GCS_Santo_DOS_1965": {usage:"Espirito Santo Island", dx:170, dy:42, dz:84},
		"GCS_Sao_Braz": {usage:"Azores (Sao Miguel; Santa Maria Ids)", dx:-203, dy:141, dz:53},
		"GCS_Sapper_Hill_1943": {usage:"East Falkland Island", dx:-355, dy:21, dz:72},
		"GCS_Schwarzeck": {usage:"Namibia", dx:616, dy:97, dz:-251},
		"GCS_Selvagem_Grande_1938": {usage:"Salvage Islands", dx:-289, dy:-124, dz:60},
		"GCS_Sierra_Leone_1960": {usage:"Sierra Leone", dx:-88, dy:4, dz:101},
		"GCS_South_American_1969": [
			{usage:"Argentina", dx:-62, dy:-1, dz:-37},
			{usage:"Bolivia", dx:-61, dy:2, dz:-48},
			{usage:"Brazil", dx:-60, dy:-2, dz:-41},
			{usage:"Chile", dx:-75, dy:-1, dz:-44},
			{usage:"Colombia", dx:-44, dy:6, dz:-36},
			{usage:"Ecuador", dx:-48, dy:3, dz:-44},
			{usage:"Ecuador (Baltra; Galapagos)", dx:-47, dy:26, dz:-42},
			{usage:"Guyana", dx:-53, dy:3, dz:-47},
			{usage:"MEAN FOR Argentina; Bolivia; Brazil; Chile; Colombia; Ecuador; Guyana; Paraguay; Peru; Trinidad &amp; Tobago; Venezuela", dx:-57, dy:1, dz:-41},
			{usage:"Paraguay", dx:-61, dy:2, dz:-33},
			{usage:"Peru", dx:-58, dy:0, dz:-44},
			{usage:"Trinidad &amp; Tobago", dx:-45, dy:12, dz:-33},
			{usage:"Venezuela", dx:-45, dy:8, dz:-33}],
		"GCS_South_Asia": {usage:"Singapore", dx:7, dy:-10, dz:-26},
		"GCS_Tananarive_Observatory_1925": {usage:"Madagascar", dx:-189, dy:-242, dz:-91},
		"GCS_Timbalai_1948": {usage:"Brunei; E. Malaysia (Sabah Sarawak)", dx:-679, dy:669, dz:-48},
		"GCS_Tokyo": [
			{usage:"Japan", dx:-148, dy:507, dz:685},
			{usage:"MEAN FOR Japan; South Korea; Okinawa", dx:-148, dy:507, dz:685},
			{usage:"Okinawa", dx:-158, dy:507, dz:676},
			{usage:"South Korea", dx:-147, dy:506, dz:687}],
		"GCS_Tristan_Astro_1968": {usage:"Tristan da Cunha", dx:-632, dy:438, dz:-609},
		"GCS_TWD_1967": [
			{usage:"Taiwan", dx:-730.160, dy:-346.212, dz:-472.186, rx:-0.00003863, ry:-0.00001721, rz:-0.00000197, sf:0.0000182},
			{usage:"Taiwan Leica", dx:-71.0504, dy:-168.272, dz:-131.3255, rx:-0.000008985294358843585337198673016051, ry:0.00005151518668323274274607901571412, rz:-0.000095413514103921676450466249957505, sf:0.0000235159},
			{usage:"Taiwan Garmin", dx:-767.0, dy:-358.0, dz:-176.0},
			{usage:"Taiwan Autodesk", dx:-572, dy:-385, dz:-179}],
		"GCS_TWD_1997": { usage: "Taiwan TWD97", dx: 0, dy: 0, dz: 0 },
		"GCS_Viti_Levu_1916": {usage:"Fiji (Viti Levu Island)", dx:51, dy:391, dz:-36},
		"GCS_Voirol_1960": {usage:"Algeria", dx:-123, dy:-206, dz:219},
		"GCS_Wake_Island_Astro_1952": {usage:"Wake Atoll", dx:276, dy:-57, dz:149},
		"GCS_Wake_Eniwetok_1960": {usage:"Marshall Islands", dx:102, dy:52, dz:-38},
		"GCS_WGS_1972": {usage:"Global Definition", dx:0, dy:0, dz:0},
		"GCS_WGS_1984": {usage:"Global Definition", dx:0, dy:0, dz:0},
		"GCS_Yacare": {usage:"Uruguay", dx:-155, dy:171, dz:37},
		"GCS_Zanderij": {usage:"Suriname", dx:-265, dy:120, dz:-358}
	};
	
	function CreateTransformation(pGEOGCS, sUsage)
	{
		var pTrans = TRANSes[pGEOGCS.Name];
		if (pTrans)
		{
			var pTran = pTrans;
			if (pTran.constructor != Array)
				return new _NS_.GeographicTransform(pTran.dx, pTran.dy, pTran.dz, pTran.rx, pTran.ry, pTran.rz, pTran.sf);
			for (var i in pTrans)
			{
				if (!sUsage || pTrans[i].usage == sUsage)
				{
					pTran = pTrans[i];
					return new _NS_.GeographicTransform(pTran.dx, pTran.dy, pTran.dz, pTran.rx, pTran.ry, pTran.rz, pTran.sf);
				}
			}
		}
		return null;
	}

	this.HorizontalDatum = function(SemiMajorAxis, Flattening)
	{
		this.SemiMajorAxis = SemiMajorAxis = SemiMajorAxis || 0;
		this.Flattening = Flattening = Flattening || 0;
		
		this.SemiMinorAxis = this.SemiMajorAxis*(1-this.Flattening);
		this.es = 1-(1-this.Flattening)*(1-this.Flattening);
		this.et2 = this.es/(1-this.es);
		
		this.CartesianFromGeodetic = function(locat)
		{
			if (locat.Y == 90 || locat.Y == -90)
				return new CPoint3(0, 0, ((locat.Y==-90)?-1:1)*this.SemiMajorAxis * Math.sqrt(1 - this.es) + locat.Z);
		
			var lat = locat.Y * Math.PI / 180.0;
			var lon = locat.X * Math.PI / 180.0;
			var ele = 0;
			if (locat.Z)
				ele = locat.Z;
		
			var Sin_Lat = Math.sin(lat);
			var Cos_Lat = Math.cos(lat);
			var N = this.SemiMajorAxis / Math.sqrt(1 - this.es * Sin_Lat * Sin_Lat);
			var dX = (N + ele) * Cos_Lat * Math.cos(lon);
			var dY = (N + ele) * Cos_Lat * Math.sin(lon);
			var dZ = ((1 - this.es) * N + ele) * Sin_Lat;
			return new CPoint3(dX, dY, dZ);
		}
		
		this.GeodeticFromCartesian = function(locat)
		{
			if (locat.X == 0.0 && locat.Y == 0.0)
				return new CPoint3(0.0, (locat.Z>=0.0)?90:-90, Math.abs(locat.Z)-this.SemiMinorAxis);
				
			var AD_C = 1.0026000;
			var COS_67P5 = 0.38268343236508977;
		
			var W2 = locat.X*locat.X + locat.Y*locat.Y;
			var W = Math.sqrt(W2);
			var T0 = locat.Z * AD_C;
			var S0 = Math.sqrt(T0 * T0 + W2);
			var Sin_B0 = T0 / S0;
			var Cos_B0 = W / S0;
			var Sin3_B0 = Sin_B0 * Sin_B0 * Sin_B0;
			var T1 = locat.Z + this.SemiMinorAxis * this.et2 * Sin3_B0;
			var Sum = W - this.SemiMajorAxis * this.es * Cos_B0 * Cos_B0 * Cos_B0;
			var S1 = Math.sqrt(T1*T1 + Sum * Sum);
			var Sin_p1 = T1 / S1;
			var Cos_p1 = Sum / S1;
			var Rn = this.SemiMajorAxis / Math.sqrt(1.0 - this.es * Sin_p1 * Sin_p1);
			
			var dZ=0;
			if (Cos_p1 >= COS_67P5)
				dZ = W / Cos_p1 - Rn;
			else if (Cos_p1 <= -COS_67P5)
				dZ = W / -Cos_p1 - Rn;
			else
				dZ = locat.Z / Sin_p1 - Rn * (1.0 - this.es);
			
			var dY = Math.atan(Sin_p1 / Cos_p1) * 180 / Math.PI;
			var dX=((locat.X!=0.0)?Math.atan2(locat.Y,locat.X)*180/Math.PI:((locat.Y > 0)?90:-90));
			return new CPoint3(dX, dY, dZ);
		}
		return this;
	}
	
	this.GeographicTransform = function(dx,dy,dz,rx,ry,rz,sf)
	{
		var m_dx = dx = dx || 0;
		var m_dy = dy = dy || 0;
		var m_dz = dz = dz || 0;
		var m_rx = rx = rx || 0;
		var m_ry = ry = ry || 0;
		var m_rz = rz = rz || 0;
		var m_sf = sf = sf || 0;
		
		function RotX(vect, r)
		{
			var sx = Math.sin(r);
			var cx = Math.cos(r);
			return new CPoint3(
				vect.X,
				cx * vect.Y + sx * vect.Z,
				-sx * vect.Y + cx * vect.Z);
		}
		function RotY(vect, r)
		{
			var sy = Math.sin(r);
			var cy = Math.cos(r);
			return new CPoint3(
				cy * vect.X - sy * vect.Z,
				vect.Y,
				sy * vect.X + cy * vect.Z);
		}
		function RotZ(vect, r)
		{
			var sz = Math.sin(r);
			var cz = Math.cos(r);
			return new CPoint3(
				cz * vect.X + sz * vect.Y,
				-sz * vect.X + cz * vect.Y,
				vect.Z);
		}
		
		this.Forward = function(vect)
		{
			//var tvect = RotZ(RotY(RotX(vect, m_rx), m_ry), m_rz);
			//return new CPoint3(
			//	m_dx + (1 + m_sf) * tvect.X,
			//	m_dy + (1 + m_sf) * tvect.Y,
			//	m_dz + (1 + m_sf) * tvect.Z);
	
			return new CPoint3(
				m_dx + (1 + m_sf) * (        vect.X + m_rz * vect.Y - m_ry * vect.Z),
				m_dy + (1 + m_sf) * (-m_rz * vect.X +        vect.Y + m_rx * vect.Z),
				m_dz + (1 + m_sf) * ( m_ry * vect.X - m_rx * vect.Y +        vect.Z));
		}
		
		this.Inverse = function(vect)
		{
			var tvect = new CPoint3(
				(vect.X - m_dx) / (1 + m_sf),
				(vect.Y - m_dy) / (1 + m_sf),
				(vect.Z - m_dz) / (1 + m_sf));
			//return RotX(RotY(RotZ(vect, -m_rz), -m_ry), -m_rx);
			
			return new CPoint3(
				(        tvect.X - m_rz * tvect.Y + m_ry * tvect.Z),
				( m_rz * tvect.X +        tvect.Y - m_rx * tvect.Z),
				(-m_ry * tvect.X + m_rx * tvect.Y +        tvect.Z));
			
			//return new CPoint3(
			//	-m_dx + (1 - m_sf) * (        vect.X - m_rz * vect.Y + m_ry * vect.Z),
			//	-m_dy + (1 - m_sf) * ( m_rz * vect.X +        vect.Y - m_rx * vect.Z),
			//	-m_dz + (1 - m_sf) * (-m_ry * vect.X + m_rx * vect.Y +        vect.Z));
		}
		return this;
	}

	this.CoordinateTransform = function(pSource, pDest, pTrans, locate)
	{
		var pSPCS = pSource ? pSource.PROJCS : null;
		var pSGCS = pSPCS ? pSPCS.GEOGCS : pSource ? pSource.GEOGCS : null;
		var pDPCS = pDest ? pDest.PROJCS : null;
		var pDGCS = pDPCS ? pDPCS.GEOGCS : pDest ? pDest.GEOGCS : null;
		var srcLocat = locate;
		if (pSPCS && pSPCS.Object)
			srcLocat = pSPCS.Object.Inverse(pSGCS.Object, srcLocat);
		if (pSource && pDest && pSource != pDest)
		{
			if (pSGCS && pSGCS.Object)
				srcLocat = pSGCS.Object.CartesianFromGeodetic(srcLocat);	
			if (pTrans)
				srcLocat = pTrans.Forward(srcLocat);
			else
			{
				if (pSGCS && pSGCS.toWGS84)
					srcLocat = pSGCS.toWGS84.Forward(srcLocat);
				if (pDGCS && pDGCS.toWGS84)
					srcLocat = pDGCS.toWGS84.Inverse(srcLocat);
			}
			if (pDGCS && pDGCS.Object)
				srcLocat = pDGCS.Object.GeodeticFromCartesian(srcLocat);
		}
		if (pDPCS && pDPCS.Object)
			srcLocat = pDPCS.Object.Forward(pDGCS.Object, srcLocat);
		return srcLocat;
	}

	this.Transform = function (pSource, pDest, pTrans)
	{
		var pSPCS = pSource ? pSource.PROJCS : null;
		var pSGCS = pSPCS ? pSPCS.GEOGCS : pSource ? pSource.GEOGCS : null;
		var pDPCS = pDest ? pDest.PROJCS : null;
		var pDGCS = pDPCS ? pDPCS.GEOGCS : pDest ? pDest.GEOGCS : null;
		this.Forward = function(vect)
		{
			var srcLocat = vect;
			if (pSPCS && pSPCS.Object)
				srcLocat = pSPCS.Object.Inverse(pSGCS.Object, srcLocat);
			if (pSource && pDest && pSource != pDest)
			{
				if (pSGCS && pSGCS.Object)
					srcLocat = pSGCS.Object.CartesianFromGeodetic(srcLocat);
				if (pTrans)
					srcLocat = pTrans.Forward(srcLocat);
				else
				{
					if (pSGCS && pSGCS.toWGS84)
						srcLocat = pSGCS.toWGS84.Forward(srcLocat);
					if (pDGCS && pDGCS.toWGS84)
						srcLocat = pDGCS.toWGS84.Inverse(srcLocat);
				}
				if (pDGCS && pDGCS.Object)
					srcLocat = pDGCS.Object.GeodeticFromCartesian(srcLocat);
			}
			if (pDPCS && pDPCS.Object)
				srcLocat = pDPCS.Object.Forward(pDGCS.Object, srcLocat);
			return srcLocat;
		}
		this.Inverse = function (vect)
		{
			var srcLocat = vect;
			if (pDPCS && pDPCS.Object)
				srcLocat = pDPCS.Object.Inverse(pDGCS.Object, srcLocat);
			if (pSource && pDest && pSource != pDest)
			{
				if (pDGCS && pDGCS.Object)
					srcLocat = pDGCS.Object.CartesianFromGeodetic(srcLocat);
				if (pTrans)
					srcLocat = pTrans.Inverse(srcLocat);
				else
				{
					if (pDGCS && pDGCS.toWGS84)
						srcLocat = pDGCS.toWGS84.Forward(srcLocat);
					if (pSGCS && pSGCS.toWGS84)
						srcLocat = pSGCS.toWGS84.Inverse(srcLocat);
				}
				if (pSGCS && pSGCS.Object)
					srcLocat = pSGCS.Object.GeodeticFromCartesian(srcLocat);
			}
			if (pSPCS && pSPCS.Object)
				srcLocat = pSPCS.Object.Forward(pSGCS.Object, srcLocat);
			return srcLocat;
		}
	}

	function GetDouble(s, v)
	{
		var t = parseFloat(s);
		if (isNaN(t))
			return v;
		return t;
	}

	this.ImportFromWKT = function(str)
	{
	    if (str == null || str == "")
	        return null;
	    if (str.constructor != String)
	        return str;
		var pSR = {};
		if (ParseWKT.call(pSR, str) == null)
			return null;
			
		var pPROJCS = pSR.PROJCS;
		var pGEOGCS = pSR.GEOGCS;
		if (pPROJCS)
		{
			if (pPROJCS.UNIT)
				pPROJCS.UNIT.Value = parseFloat(pPROJCS.UNIT.Value);
			if (pPROJCS.PARAMETER)
				for (var i in pPROJCS.PARAMETER)
					pPROJCS.PARAMETER[pPROJCS.PARAMETER[i].Name] = parseFloat(pPROJCS.PARAMETER[i].Value);
			pGEOGCS = pPROJCS.GEOGCS;
			pPROJCS.Object = Projection.Create(pPROJCS.PROJECTION.Name, pSR.PROJCS.PARAMETER);
		}
		if (pGEOGCS)
		{
			if (pGEOGCS.PRIMEM)
				pGEOGCS.PRIMEM.Value = parseFloat(pGEOGCS.PRIMEM.Value);
			if (pGEOGCS.UNIT)
				pGEOGCS.UNIT.Value = parseFloat(pGEOGCS.UNIT.Value);
			if (pGEOGCS.DATUM && pGEOGCS.DATUM.SPHEROID)
			{
				pGEOGCS.DATUM.SPHEROID.SemiMajorAxis = parseFloat(pGEOGCS.DATUM.SPHEROID.Value[0]);
				pGEOGCS.DATUM.SPHEROID.InverseFlattening = parseFloat(pGEOGCS.DATUM.SPHEROID.Value[1]);
			}
			if (pGEOGCS.DATUM)
			{
				var pSpd = pGEOGCS.DATUM.SPHEROID;
				var f = 0;
				if (pSpd.InverseFlattening != 0)
					f = 1 / pSpd.InverseFlattening;
				pGEOGCS.Object = new _NS_.HorizontalDatum(pSpd.SemiMajorAxis, f);
				var pTO84 = pGEOGCS.DATUM.TOWGS84;
				if (pTO84)
				{
					var dx = GetDouble(pTO84.Name, 0);
					var dy = GetDouble(pTO84.Value[0], 0);
					var dz = GetDouble(pTO84.Value[1], 0);
					var rx = GetDouble(pTO84.Value[2], 0) * Math.PI / 180.0;
					var ry = GetDouble(pTO84.Value[3], 0) * Math.PI / 180.0;
					var rz = GetDouble(pTO84.Value[4], 0) * Math.PI / 180.0;
					var sf = GetDouble(pTO84.Value[5], 0) / 1000000.0;
					pGEOGCS.toWGS84 = new _NS_.GeographicTransform(dx, dy, dz, rx, ry, rz, sf);
				}
			}
			if (pGEOGCS.toWGS84 == null)
				pGEOGCS.toWGS84 = CreateTransformation(pGEOGCS);
		}
		return pSR;
	}
	
	this.ExportToWKT = function(pSR)
	{
		var strs = [];
		for (var m in pSR)
		{
			if (m == "Name")
				continue;
			var pO = pSR[m];
			if (pO == null)
				continue;
			if (pO.constructor != Array)
				pO = [pO];
			for (var n in pO)
				if (m == "Value")
					strs.push(pO[n]);
				else if (pO[n].constructor == Object)
				{
					var ss = this.ExportToWKT(pO[n]);
					if (ss.length > 0)
						strs.push(m + "['" + pO[n].Name + "'," + ss + "]");
					else
						strs.push(m + "['" + pO[n].Name + "']");
				}
		}
		return strs.join(",");
	}
	
	function TrimLeft(str)
	{
		if (str == null)
			return null;
		return str.substr(str.search(/\S/));
	}

	function TrimString(str)
	{
		if (str == null)
			return null;
		return TrimLeft(str).replace(/['\"]/g, "");
	}
	
	function AppendObject(pCont, pObj)
	{
		if (pCont)
		{
			if (pCont.constructor != Array)
				pCont = [pCont];
			pCont.push(pObj);
			return pCont;
		}
		return pObj;
	}

	function ParseWKT(str)
	{
		if (str == null)
			return null;
		var s = str.search(/[,\[\]]/);
		if (s < 0) s = str.length;
		var st = str.substring(0, s);
		if (str.charAt(s) != "[")
		{
			this.Value = AppendObject(this.Value, TrimString(st));
			return str.substr(s);
		}
				
		str = str.substr(st.length + 1);
		st = TrimLeft(st.toUpperCase());
		var pObj = {};
		this[st] = AppendObject(this[st], pObj);
		
		var i = str.search(/[,\]]/);
		if (i < 0)
			return null;
		pObj.Name = TrimString(str.substring(0, i));
		if (str.charAt(i) == "]")
			return str.substr(i + 1);
		str = str.substr(i + 1);
		while (true)
		{
			str = ParseWKT.call(pObj, str);
			if (str == null || str.length == 0)
				return null;
			str = TrimLeft(str);
			if (str.charAt(0) != ",")
				break;
			str = str.substr(1);
		}
		if (str == null || str.length < 1 || str.charAt(0) != "]")
			return null;
		return str.substr(1);
	}
}

function CPoint3(dX, dY, dZ)
{
	this.X = dX;
	this.Y = dY;
	this.Z = dZ;

	this.toString = function()
	{
		return "(" + this.X + "," + this.Y + "," + this.Z + ")";
	}
	this.Distance = function()
	{
		return Math.sqrt(this.X * this.X + this.Y * this.Y + this.Z * this.Z);
	}
	this.Vector = function()
	{
		return [ this.X,  this.Y, this.Z ];
	}
	return this;
}
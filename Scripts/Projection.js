var Projection = new function()
{
	var _NS_ = this;
	var HALFPI = Math.PI / 2;
	var FORTPI = Math.PI / 4;
	function pj_tsfn(phi, sinphi, e)
	{
		sinphi *= e;
		return (Math.tan (.5 * (HALFPI - phi)) / Math.pow((1. - sinphi) / (1. + sinphi), .5 * e));
	}
	
	function pj_phi2(ts, e)
	{
		var eccnth = .5 * e;
		var Phi = HALFPI - 2. * Math.atan(ts);
		i = 15;
		do {
			var con = e * Math.sin (Phi);
			var dphi = HALFPI - 2. * Math.atan (ts * Math.pow((1. - con) / (1. + con), eccnth)) - Phi;
			Phi += dphi;
		} while ( Math.abs(dphi) > 1.0e-10 && --i);
		return Phi;
	}
	
	function pj_mlfn(phi, sphi, cphi, es) 
	{
		var tt;
		var en0 = 1 - es * (.25 + es * (.046875 + es * (.01953125 + es * .01068115234375)));
		var en1 = es * (.75 - es * (.046875 + es * (.01953125 + es * .01068115234375)));
		var en2 = (tt = es * es) * (.46875 - es * (.01302083333333333333 + es * .00712076822916666666));
		var en3 = (tt *= es) * (.36458333333333333333 - es * .00569661458333333333);
		var en4 = tt * es * .3076171875;
		
		cphi *= sphi;
		sphi *= sphi;
		return(en0 * phi - cphi * (en1 + sphi*(en2 + sphi*(en3 + sphi*en4))));
	}
	
	function pj_inv_mlfn(arg, es) 
	{
		var k = 1./(1.-es);
		var phi = arg;
		
		var i;
		for (i = 10; i ; --i) 
		{ /* rarely goes over 2 iterations */
			var s = Math.sin(phi);
			var t = 1. - es * s * s;
			phi -= t = (pj_mlfn(phi, s, Math.cos(phi), es) - arg) * (t * Math.sqrt(t)) * k;
			if (Math.abs(t) < 1e-11)
				return phi;
		}
		return phi;
	}
	
	function pj_iterphi(v, e2) 
	{
		return v 
			+ e2 * ((1. / 2. + e2 * (5. / 24. + e2 * (1. / 12. + e2 * 13. / 360.))) * Math.sin(2. * v)
				+ e2 * ((7. / 48. + e2 * (29. / 240. + e2 * 811. / 11520.)) * Math.sin(4. * v)
					+ e2 * ((7. / 120. + e2 * 81. / 1120.) * Math.sin(6. * v)
						+ (e2 * 4279. / 161280.) * Math.sin(8. * v))));
	}
	this.Create = function(sName, pParam)
	{
		switch (sName)
		{
		case "Mercator":
		case "Wright":
			return new _NS_.Mercator(pParam.Central_Meridian, pParam.False_Easting, pParam.False_Northing, pParam.Scale_Factor);
		case "Pseudo_Mercator":
		case "Popular Visualisation Pseudo Mercator":
		case "Mercator_1SP":
		case "Mercator_Auxiliary_Sphere":
			return new _NS_.PseudoMercator(pParam.Central_Meridian, pParam.Standard_Parallel_1, pParam.False_Easting, pParam.False_Northing);
		case "Transverse_Mercator":
		case "Transverse Mercator":
		case "Gauss_Kruger":
		case "Gauss Conformal":
		case "Transverse Cylidrical":
			return new _NS_.TransverseMercator(
				pParam.Central_Meridian || pParam.central_meridian,
				pParam.False_Easting || pParam.false_easting,
				pParam.False_Northing || pParam.false_northing,
				pParam.Latitude_Of_Origin || pParam.latitude_of_origin,
				pParam.Scale_Factor || pParam.scale_factor);
		case "Oblique Mercator (Hotine)":
		case "Hotine_Oblique_Mercator_Azimuth_Natural_Origin":
		case "Rectified_Skew_Orthomorphic_Natural_Origin":
			return new _NS_.ObliqueMercator(pParam.Azimuth, pParam.Latitude_Of_Center, pParam.Longitude_Of_Center, pParam.False_Easting, pParam.False_Northing, pParam.Scale_Factor, pParam.XY_Plane_Rotation);
		case "Orthographic":
			return new _NS_.Orthographic(pParam.Central_Meridian, pParam.Latitude_Of_Origin, pParam.False_Easting, pParam.False_Northing);
		case "Equirectangular":
			return new _NS_.Equirectangular(pParam.Central_Meridian, pParam.Standard_Parallel_1, pParam.False_Easting, pParam.False_Northing);
		case "Mollweide":
			return new _NS_.Mollweide(pParam.Central_Meridian, pParam.False_Easting, pParam.False_Northing);
		case "Lambert_Conformal_Conic":
			return new _NS_.Lambert_Conformal_Conic(pParam.Central_Meridian, pParam.Standard_Parallel_1, pParam.Standard_Parallel_2, pParam.False_Easting, pParam.False_Northing, pParam.Latitude_Of_Origin);
		}
		return null;
	}
	
	this.Lambert_Conformal_Conic = function(centralMeridian, standardParallel1, standardParallel2, falseEasting, falseNorthing, latitudeOfOrigin)
	{
		this.centralMeridian = centralMeridian = centralMeridian || 0;
		this.standardParallel1 = standardParallel1 = standardParallel1 || 0;
		this.standardParallel2 = standardParallel2 = standardParallel2 || 0;
		this.falseEasting = falseEasting = falseEasting || 0;
		this.falseNorthing = falseNorthing = falseNorthing || 0;
		this.latitudeOfOrigin = latitudeOfOrigin = latitudeOfOrigin || 0;
		
		this.Forward = function(ellip, pnt)
		{
			var tpt = CPoint3(pnt.X - centralMeridian, pnt.Y, pnt.Z);
			//if (ellip.es == 0)
				pnt = SpheroidForward(ellip, tpt);
			//else
			//	pnt = EllipseForward(ellip, tpt);
			pnt.X = pnt.X * ellip.SemiMajorAxis + falseEasting;
			pnt.Y = pnt.Y * ellip.SemiMajorAxis + falseNorthing;
			return pnt;
		}
		this.Inverse = function(ellip, pnt)
		{
			var tpt = CPoint3((pnt.X - falseEasting) / ellip.SemiMajorAxis, (pnt.Y - falseNorthing) / ellip.SemiMajorAxis, pnt.Z);
			//if (ellip.es == 0)
				pnt = SpheroidInverse(ellip, tpt);
			//else
			//	pnt = EllipseInverse(ellip, tpt);
			pnt.X = pnt.X + centralMeridian;
			return pnt;
		}
		function SpheroidForward(ellip, pnt)
		{
			var dLO = latitudeOfOrigin * Math.PI / 180;
			var dSP1 = standardParallel1 * Math.PI / 180;
			var dSP2 = standardParallel2 * Math.PI / 180;
			var c1 = Math.cos(dSP1);
			var n = Math.sin(dSP1);
			if (dSP1 != dSP2)
				n = Math.log(c1 / Math.cos(dSP2)) / Math.log(Math.tan(Math.PI / 4 + dSP2 / 2) / Math.tan(Math.PI / 4 + dSP1 / 2));
			var F = c1 * Math.pow(Math.tan(Math.PI / 4 + dSP1 / 2), n) / n;
			var p0 = 1 / Math.pow(Math.tan(Math.PI / 4 + dLO / 2), n);

			var thita = n * pnt.X * Math.PI / 180;
			var phi = pnt.Y * Math.PI / 180;
			var p = Number.NaN;
			if (Math.abs(pnt.Y) != 90) 
				p = 1 / Math.pow(Math.tan(Math.PI / 4 + phi / 2), n);
			var tmx = F * p * Math.sin(thita);
			var tmy = F * (p0 - p * Math.cos(thita));
			return new CPoint3(tmx, tmy, pnt.Z);
		}
		function SpheroidInverse(ellip, pnt)
		{
			var dLO = latitudeOfOrigin * Math.PI / 180;
			var dSP1 = standardParallel1 * Math.PI / 180;
			var dSP2 = standardParallel2 * Math.PI / 180;
			var n = Math.log(Math.cos(dSP1) / Math.cos(dSP2)) / Math.log(Math.tan(Math.PI / 4 + dSP2 / 2) / Math.tan(Math.PI / 4 + dSP1 / 2));
			var F = Math.cos(dSP1) * Math.pow(Math.tan(Math.PI / 4 + dSP1 / 2), n) / n;
			var p0 = F / Math.pow(Math.tan(Math.PI / 4 + dLO / 2), n);

			pnt.Y = p0 - pnt.Y;
			var thita = (pnt.Y == 0 ? Math.atan2(pnt.X, pnt.Y) : Math.atan(pnt.X / pnt.Y));
			var p = Math.hypot(pnt.X, pnt.Y) * ((n < 0) ? -1 : 1);
			var lam = thita / n;
			var phi = 2 * Math.atan(Math.pow(F / p, 1 / n)) - Math.PI / 2;
			var lon = lam * 180 / Math.PI;
			var lat = phi * 180 / Math.PI;
			return new CPoint3(lon, lat, pnt.Z);
		}
		return this;
	}
	
	this.Mercator = function(centralMeridian, falseEasting, falseNorthing, scaleFactor)
	{
		this.centralMeridian = centralMeridian = centralMeridian || 0;
		this.falseEasting = falseEasting = falseEasting || 0;
		this.falseNorthing = falseNorthing = falseNorthing || 0;
		this.scaleFactor = scaleFactor = scaleFactor || 1;
		
		this.Forward = function(ellip, pnt)
		{
			var tpt = CPoint3(pnt.X - centralMeridian, pnt.Y, pnt.Z);
			if (ellip.es == 0)
				pnt = SpheroidForward(ellip, tpt);
			else
				pnt = EllipseForward(ellip, tpt);
			pnt.X = pnt.X*scaleFactor*ellip.SemiMajorAxis + falseEasting;
			pnt.Y = pnt.Y*scaleFactor*ellip.SemiMajorAxis + falseNorthing;
			return pnt;
		}
		this.Inverse = function(ellip, pnt)
		{
			var tpt = CPoint3((pnt.X-falseEasting)/ellip.SemiMajorAxis/scaleFactor, (pnt.Y-falseNorthing)/ellip.SemiMajorAxis/scaleFactor, pnt.Z);
			if (ellip.es == 0)
				pnt = SpheroidInverse(ellip, tpt);
			else
				pnt = EllipseInverse(ellip, tpt);
			pnt.X = pnt.X + centralMeridian;
			return pnt;
		}
		
		function EllipseForward(ellip, pnt)
		{
			var py = pnt.Y;
			if (py >= 87.5) py = 87.5;
			else if (py <= -87.5) py = -87.5;
			var tmx = pnt.X * Math.PI / 180;
			var tmy = -Math.log(pj_tsfn(py * Math.PI / 180, Math.sin(py * Math.PI / 180), Math.sqrt(ellip.es)));
			return new CPoint3(tmx, tmy, pnt.Z);
		}
		function SpheroidForward(ellip, pnt)
		{
			var py = pnt.Y;
			if (py >= 87.5) py = 87.5;
			else if (py <= -87.5) py = -87.5;
			var tmx = pnt.X * Math.PI / 180;
			var tmy = Math.log(Math.tan(FORTPI + pnt.Y * Math.PI / 360));
			return new CPoint3(tmx, tmy, pnt.Z);
		}
		function EllipseInverse(ellip, pnt)
		{
			var lat = pj_phi2(Math.exp(- pnt.Y), Math.sqrt(ellip.es)) * 180 / Math.PI;
			var lon = pnt.X * 180 / Math.PI;
			return new CPoint3(lon, lat, pnt.Z);
		}
		function SpheroidInverse(ellip, pnt)
		{
			var lat = 90 - 2. * Math.atan(Math.exp(-pnt.Y)) * 180 / Math.PI;
			var lon = pnt.X * 180 / Math.PI;
			return new CPoint3(lon, lat, pnt.Z);
		}
		return this;
	}
	
	this.PseudoMercator = function(centralMeridian, standardParallel1, falseEasting, falseNorthing)
	{
		this.centralMeridian = centralMeridian = centralMeridian || 0;
		this.standardParallel1 = standardParallel1 = standardParallel1 || 0;
		this.falseEasting = falseEasting = falseEasting || 0;
		this.falseNorthing = falseNorthing = falseNorthing || 0;

		this.Forward = function(ellip, pnt)
		{
			var tpt = CPoint3(pnt.X-centralMeridian, pnt.Y, pnt.Z);
			pnt = SpheroidForward(ellip, tpt);
			pnt.X = pnt.X*ellip.SemiMajorAxis + falseEasting;
			pnt.Y = pnt.Y*ellip.SemiMajorAxis + falseNorthing;
			return pnt;
		}
		this.Inverse = function(ellip, pnt)
		{
			var tpt = CPoint3((pnt.X-falseEasting)/ellip.SemiMajorAxis, (pnt.Y-falseNorthing)/ellip.SemiMajorAxis, pnt.Z);
			pnt = SpheroidInverse(ellip, tpt);
			pnt.X = pnt.X + centralMeridian;
			pnt.Y = pnt.Y;
			return pnt;
		}
		function SpheroidForward(ellip, pnt)
		{
			var py = pnt.Y;
			if (py >= 87.5) py = 87.5;
			else if (py <= -87.5) py = -87.5;
			var tmx = pnt.X * Math.PI / 180;
			var tmy = Math.log(Math.tan(FORTPI + pnt.Y * Math.PI / 360));
			return new CPoint3(tmx, tmy, pnt.Z);
		}
		function SpheroidInverse(ellip, pnt)
		{
			var lat = 90 - 2. * Math.atan(Math.exp(-pnt.Y)) * 180 / Math.PI;
			var lon = pnt.X * 180 / Math.PI;
			return new CPoint3(lon, lat, pnt.Z);
		}
		return this;
	}
	
	this.TransverseMercator = function(centralMeridian, falseEasting, falseNorthing, latitudeOfOrigin, scaleFactor)
	{
		this.centralMeridian = centralMeridian = centralMeridian || 0;
		this.falseEasting = falseEasting = falseEasting || 0;
		this.falseNorthing = falseNorthing = falseNorthing || 0;
		this.latitudeOfOrigin = latitudeOfOrigin = latitudeOfOrigin || 0;
		this.scaleFactor = scaleFactor = scaleFactor || 1;
		
		this.Forward = function(ellip, pnt)
		{
			var tpt = CPoint3((pnt.X-centralMeridian)*Math.PI/180, pnt.Y*Math.PI/180, pnt.Z);
			if (ellip.es == 0)
				pnt = SpheroidForward(ellip, tpt);
			else
				pnt = EllipseForward(ellip, tpt);
			pnt.X = pnt.X*scaleFactor*ellip.SemiMajorAxis + falseEasting;
			pnt.Y = pnt.Y*scaleFactor*ellip.SemiMajorAxis + falseNorthing;
			return pnt;
		}
		
		this.Inverse = function(ellip, pnt)
		{
			var tpt = CPoint3((pnt.X-falseEasting)/ellip.SemiMajorAxis/scaleFactor, (pnt.Y-falseNorthing)/ellip.SemiMajorAxis/scaleFactor, pnt.Z);
			if (ellip.es == 0)
				pnt = SpheroidInverse(ellip, tpt);
			else
				pnt = EllipseInverse(ellip, tpt);
			pnt.X = pnt.X*180/Math.PI+centralMeridian;
			pnt.Y = pnt.Y*180/Math.PI;
			return pnt;
		}
	
		function EllipseForward(ellip, pnt)
		{
			var sinphi = Math.sin(pnt.Y); 
			var cosphi = Math.cos(pnt.Y);
			var t = Math.abs(cosphi) > 1e-10 ? sinphi/cosphi : 0.;
			t *= t;
			var al = cosphi * pnt.X;
			var als = al * al;
			al /= Math.sqrt(1. - ellip.es * sinphi * sinphi);
			var n = ellip.et2 * cosphi * cosphi;
			var tmx = al * (1 +
				als / 6 * (1. - t + n +
				als / 20 * (5. + t * (t - 18.) + n * (14. - 58. * t)
				+ als / 42 * (61. + t * ( t * (179. - t) - 479. ) )
				)));
	
			var lat0 = latitudeOfOrigin*Math.PI/180;
			var ml0 = pj_mlfn(lat0, Math.sin(lat0), Math.cos(lat0), ellip.es);
			
			var tmy = pj_mlfn(pnt.Y, sinphi, cosphi, ellip.es) - ml0 +
				sinphi * al * pnt.X / 2 * ( 1. +
				als / 12 * (5. - t + n * (9. + 4. * n) +
				als / 30 * (61. + t * (t - 58.) + n * (270. - 330 * t)
				+ als / 56 * (1385. + t * ( t * (543. - t) - 3111.) )
				)));
	
			return new CPoint3(tmx, tmy, pnt.Z);
		}
	
		function EllipseInverse(ellip, pnt)
		{
			var lat0 = latitudeOfOrigin*Math.PI/180;
			var ml0 = pj_mlfn(lat0, Math.sin(lat0), Math.cos(lat0), ellip.es);
			var lat = pj_inv_mlfn(ml0 + pnt.Y, ellip.es);
			
			var HALFPI = Math.PI / 2;
			if (Math.abs(lat) >= HALFPI)
				return new CPoint3(0, (pnt.Y < 0. ? -HALFPI : HALFPI), pnt.Z);
				
			var sinphi = Math.sin(lat);
			var cosphi = Math.cos(lat);
			var t = Math.abs(cosphi) > 1e-10 ? sinphi/cosphi : 0.;
			var n = ellip.et2 * cosphi * cosphi;
			var con = 1. - ellip.es * sinphi * sinphi
			var d = pnt.X * Math.sqrt(con);
			con *= t;
			t *= t;
			var ds = d * d;
			lat -= (con * ds / (1.-ellip.es)) / 2 * (1. -
				ds / 12 * (5. + t * (3. - 9. *  n) + n * (1. - 4 * n) -
				ds / 30 * (61. + t * (90. - 252. * n +
					45. * t) + 46. * n
			   - ds / 56 * (1385. + t * (3633. + t * (4095. + 1574. * t)) )
				)));
			var lon = d*(1 -
				ds / 6 * ( 1. + 2.*t + n -
				ds / 20 * (5. + t*(28. + 24.*t + 8.*n) + 6.*n
			   - ds /42 * (61. + t * (662. + t * (1320. + 720. * t)) )
				))) / cosphi;
				
			return new CPoint3(lon, lat, pnt.Z);
		}
		
		function SphereForward(ellip, pnt)
		{
			var cosphi = Math.cos(pnt.Y);
			var b = cosphi * Math.sin(pnt.X);
			if (Math.abs(Math.abs(b) - 1.) <= 1.e-10) return null;
			var lat0 = latitudeOfOrigin*Math.PI/180;
			
			var tmx = Math.log((1. + b) / (1. - b)) * .5;
			var tmy = cosphi * Math.cos(pnt.X) / Math.sqrt(1. - b * b);
			b = Math.abs(tmy);
			if (b < 1.) tmy = Math.acos(tmy);
			else if ((b - 1.) < 1.e-10) tmy = 0;
			else return null;
	
			if (pnt.Y < 0.) tmy = -tmy;
			tmy = tmy - lat0;
			
			return new CPoint3(tmx, tmy, pnt.Z);
		}
	
		function SphereInverse(ellip, pnt)
		{
			var lat0 = latitudeOfOrigin*Math.PI/180;
			
			var h = Math.exp(pnt.X);
			var g = .5 * (h - 1. / h);
			h = Math.cos(lat0 + pnt.Y);
			var lat = Math.asin(Math.sqrt((1. - h * h) / (1. + g * g)));
			if (pnt.Y < 0.) lat = -lat;
			var lon = (g || h) ? Math.atan2(g, h) : 0.;
			
			return new CPoint3(lon, lat, pnt.Z);
		}
		
		//function M(phi, es)
		//{
		//	if (phi == 0.0)
		//		return 0.0;
		//	else {
		//		return (1.0 - es / 4.0 - 3.0 * es * es / 64.0 - 5.0 * es * es * es / 256.0) * phi -
		//			(3.0 * es / 8.0 + 3.0 * es * es / 32.0 + 45.0 * es * es * es / 1024.0) * Math.sin(2.0 * phi) +
		//			(15.0 * es * es / 256.0 + 45.0 * es * es * es / 1024.0) * Math.sin(4.0 * phi) -
		//			(35.0 * es * es * es / 3072.0) * Math.sin(6.0 * phi);
		//	}
		//}
		//
		//function EllipseForward(ellip, pnt)
		//{
		//	var lat0 = latitudeOfOrigin*Math.PI/180;
		//	var es = ellip.es;
		//	var et2 = ellip.et2;
		//	var m0 = M(lat0, es);
		//	var m = M(pnt.Y, es);
		//	var n = 1 / Math.sqrt(1 - es * Math.pow(Math.sin(pnt.Y), 2.0));
		//	var t = Math.tan(pnt.Y);
		//	t *= t;
		//	var c = Math.cos(pnt.Y);
		//	c = et2 * c * c;
		//	var A = pnt.X * Math.cos(pnt.Y);
	    //
		//	var tmx = n * 
		//		(A + (1.0 - t + c) * A * A * A / 6.0 
		//			+ (5.0 - 18.0 * t + t * t + 72.0 * c - 58.0 * et2) * Math.pow(A, 5.0) / 120.0);
		//	var tmy = m - m0 + n * Math.tan(pnt.Y) * 
		//		(A * A / 2.0
		//			+ (5.0 - t + 9.0 * c + 4 * c * c) * Math.pow(A, 4.0) / 24.0
		//			+ (61.0 - 58.0 * t + t * t + 600.0 * c - 330.0 * et2) * Math.pow(A, 6.0) / 720.0);
		//	return new CPoint3(tmx, tmy, pnt.Z);
		//}
		//function EllipseInverse2(ellip, pnt)
		//{
		//	var lat0 = latitudeOfOrigin*Math.PI/180;
		//	
		//	var es = ellip.es;
		//	var et2 = ellip.et2;
		//
		//	var e1 = (1.0 - Math.sqrt(1.0 - es)) / (1.0 + Math.sqrt(1.0 - es));
		//	var mu1 = (3.0 * e1 / 2.0 - 27.0 * Math.pow(e1, 3.0) / 32.0);
		//	var mu2 = (21.0 * e1 * e1 / 16.0 - 55.0 * Math.pow(e1, 4.0) / 32.0);
		//	var mu3 = 151.0 * Math.pow(e1, 3.0) / 96.0;
		//	var mu4 = 1097.0 * Math.pow(e1, 4.0) / 512.0;
		//	
		//	var l = 1/ (1.0 - es / 4.0 - 3.0 * es * es / 64.0 - 5.0 * es * es * es / 256.0);
		//	var m0 = M(lat0, es);
		//	var m = m0 + pnt.Y;
		//	var mu = m * l;
		//	var phi1 = mu + mu1 * Math.sin(2.0 * mu)
		//			+ mu2 * Math.sin(4.0 * mu) 
		//			+ mu3 * Math.sin(6.0 * mu)
		//			+ mu4 * Math.sin(8.0 * mu);
	    //
		//	var c1 = et2 * Math.pow(Math.cos(phi1), 2.0);
		//	var t1 = Math.pow(Math.tan(phi1), 2.0);
		//	var n1 = 1 / Math.sqrt(1 - es * Math.pow(Math.sin(phi1), 2.0));
		//	var r1 = (1.0 - es) / Math.pow(1.0 - es * Math.pow(Math.sin(phi1), 2.0), 1.5);
		//	var d = pnt.X / n1;
	    //
		//	var lat = (phi1 - n1 * Math.tan(phi1) / r1
		//			* (d * d / 2.0 - (5.0 + 3.0 * t1 + 10.0 * c1 - 4.0 * c1 * c1 - 9.0 * et2)
		//			* Math.pow(d, 4.0) / 24.0 + (61.0 + 90.0 * t1 + 298.0 * c1 + 45.0 * t1 * t1
		//			- 252.0 * et2 - 3.0 * c1 * c1) * Math.pow(d, 6.0) / 720.0));
		//	var lon = (d - (1.0 + 2.0 * t1 + c1) * Math.pow(d, 3.0) / 6.0
		//			+ (5.0 -2.0 * c1 + 28.0 * t1 - 3.0 * c1 * c1 + 8.0 * et2 + 24.0 * t1 * t1)
		//			* Math.pow(d, 5.0) / 120.0) / Math.cos(phi1);
		//	return new CPoint3(lon, lat, pnt.Z);
		//}
		return this;
	}
	
	this.Orthographic = function(centralMeridian, latitudeOfOrigin, falseEasting, falseNorthing)
	{
		this.centralMeridian = centralMeridian = centralMeridian || 0;
		this.latitudeOfOrigin = latitudeOfOrigin = latitudeOfOrigin || 0;
		this.falseEasting = falseEasting = falseEasting || 0;
		this.falseNorthing = falseNorthing = falseNorthing || 0;
		
		this.Forward = function(ellip, pnt)
		{
			var tpt = CPoint3((pnt.X-centralMeridian)*Math.PI/180, pnt.Y*Math.PI/180, pnt.Z);
			pnt = SpheroidForward(ellip, tpt);
			pnt.X = pnt.X*ellip.SemiMajorAxis + falseEasting;
			pnt.Y = pnt.Y*ellip.SemiMajorAxis + falseNorthing;
			return pnt;
		}
		this.Inverse = function(ellip, pnt)
		{
			var tpt = CPoint3((pnt.X-falseEasting)/ellip.SemiMajorAxis, (pnt.Y-falseNorthing)/ellip.SemiMajorAxis, pnt.Z);
			pnt = SpheroidInverse(ellip, tpt);
			pnt.X = pnt.X*180/Math.PI+centralMeridian;
			pnt.Y = pnt.Y*180/Math.PI;
			return pnt;
		}
		
		function SpheroidForward(ellip, pnt)
		{
			var s0 = Math.sin(latitudeOfOrigin*Math.PI/180);
			var c0 = Math.cos(latitudeOfOrigin*Math.PI/180);
			var slam = Math.sin(pnt.X);
			var clam = Math.cos(pnt.X);
			var sphi = Math.sin(pnt.Y);
			var cphi = Math.cos(pnt.Y);
	
			var x = cphi * slam;
			var y = c0 * sphi - s0 * cphi * clam;
			var cc = s0 * sphi + c0 * cphi * clam;
			if (cc < 0)
			{
				var p = 1 / Math.sqrt(x * x + y * y);
				x *= p;
				y *= p;
			}
			return new CPoint3(x, y, pnt.Z);
		}
		function SpheroidInverse(ellip, pnt)
		{
			var s0 = Math.sin(latitudeOfOrigin*Math.PI/180);
			var c0 = Math.cos(latitudeOfOrigin*Math.PI/180);
			var x = pnt.X;
			var y = pnt.Y;
			var sc2 = x * x + y * y;
			if (sc2 > 1) sc2 = 1;
			var cc = Math.sqrt(1 - sc2);
			var lam = Math.atan2(x, c0 * cc - y * s0);
			var phi = Math.asin(cc * s0 + y * c0);
			return new CPoint3(lam, phi, pnt.Z);
		}
		return this;
	}
	
	this.Equirectangular = function(centralMeridian, standardParallel1, falseEasting, falseNorthing)
	{
		this.centralMeridian = centralMeridian = centralMeridian || 0;
		this.standardParallel1 = standardParallel1 = standardParallel1 || 0;
		this.falseEasting = falseEasting = falseEasting || 0;
		this.falseNorthing = falseNorthing = falseNorthing || 0;
		
		this.Forward = function(ellip, pnt)
		{
			var tpt = CPoint3((pnt.X-centralMeridian)*Math.PI/180, pnt.Y*Math.PI/180, pnt.Z);
			pnt = SpheroidForward(ellip, tpt);
			pnt.X = pnt.X*ellip.SemiMajorAxis + falseEasting;
			pnt.Y = pnt.Y*ellip.SemiMajorAxis + falseNorthing;
			return pnt;
		}
		this.Inverse = function(ellip, pnt)
		{
			var tpt = CPoint3((pnt.X-falseEasting)/ellip.SemiMajorAxis, (pnt.Y-falseNorthing)/ellip.SemiMajorAxis, pnt.Z);
			pnt = SpheroidInverse(ellip, tpt);
			pnt.X = pnt.X*180/Math.PI+centralMeridian;
			pnt.Y = pnt.Y*180/Math.PI;
			return pnt;
		}
		
		function SpheroidForward(ellip, pnt)
		{
			var x = pnt.X * Math.cos(standardParallel1*Math.PI/180);
			var y = pnt.Y;
			return new CPoint3(x, y, pnt.Z);
		}
		function SpheroidInverse(ellip, pnt)
		{
			var lam = pnt.X / Math.cos(standardParallel1*Math.PI/180);
			var phi = pnt.Y;
			return new CPoint3(lam, phi, pnt.Z);
		}
		return this;
	}
	
	this.Mollweide = function(centralMeridian, falseEasting, falseNorthing)
	{
		this.centralMeridian = centralMeridian = centralMeridian || 0;
		this.falseEasting = falseEasting = falseEasting || 0;
		this.falseNorthing = falseNorthing = falseNorthing || 0;
		
		this.Forward = function(ellip, pnt)
		{
			var tpt = CPoint3((pnt.X-centralMeridian)*Math.PI/180, pnt.Y*Math.PI/180, pnt.Z);
			pnt = SpheroidForward(ellip, tpt);
			pnt.X = pnt.X*ellip.SemiMajorAxis + falseEasting;
			pnt.Y = pnt.Y*ellip.SemiMajorAxis + falseNorthing;
			return pnt;
		}
		this.Inverse = function(ellip, pnt)
		{
			var tpt = CPoint3((pnt.X-falseEasting)/ellip.SemiMajorAxis, (pnt.Y-falseNorthing)/ellip.SemiMajorAxis, pnt.Z);
			pnt = SpheroidInverse(ellip, tpt);
			pnt.X = pnt.X*180/Math.PI+centralMeridian;
			pnt.Y = pnt.Y*180/Math.PI;
			return pnt;
		}
		
		function SpheroidForward(ellip, pnt)
		{
			var Cy = Math.sqrt(2.);
			var Cx = 2. * Cy / Math.PI;
			
			var lam = pnt.X;
			var phi = pnt.Y;
			var x = 0;
			var y = Cy * (phi >= 0 ? 1 : -1);
			if (Math.abs(phi) < Math.PI / 2)
			{
				var thita = phi;
				var dsita;
				do
				{
					dsita = -(thita + Math.sin(thita) - Math.PI * Math.sin(phi)) / (1 + Math.cos(thita));
					thita += dsita;
				} while (Math.abs(dsita) > 1e-10);
				thita *= .5;
				x = Cx * lam * Math.cos(thita);
				y = Cy * Math.sin(thita);
			}
			return new CPoint3(x, y, pnt.Z);
		}
		function SpheroidInverse(ellip, pnt)
		{
			var Cy = Math.sqrt(2.);
			var Cx = 2. * Cy / Math.PI;
			var x = pnt.X;
			var y = pnt.Y;
			var lam = 0;
			var phi = 0;
			if (Math.abs(y) >= Cy)
				phi = Math.PI / 2 * (y >= 0 ? 1 : -1);
			else
			{
				var thita = Math.asin(y / Cy);
				lam = x / (Cx * Math.cos(thita));
				phi = Math.asin((2 * thita + Math.sin(2 * thita)) / Math.PI);
			}
			return new CPoint3(lam, phi, pnt.Z);
		}
		return this;
	}
	
	this.ObliqueMercator = function(azimuth, latitudeOfCenter, longitudeOfCenter, falseEasting, falseNorthing, scaleFactor, xYPlaneRotation)
	{
		this.azimuth  = azimuth = azimuth || 0;
		this.latitudeOfCenter = latitudeOfCenter = latitudeOfCenter || 0;
		this.longitudeOfCenter = longitudeOfCenter = longitudeOfCenter || 0;
		this.falseEasting = falseEasting = falseEasting || 0;
		this.falseNorthing = falseNorthing = falseNorthing || 0;
		this.scaleFactor = scaleFactor = scaleFactor || 1;
		this.xYPlaneRotation = xYPlaneRotation = xYPlaneRotation || 0;
		
		this.Forward = function(ellip, pnt)
		{
			var tpt = CPoint3(pnt.X*Math.PI/180, pnt.Y*Math.PI/180, pnt.Z);
			if (ellip.es == 0)
				pnt = SpheroidForward(ellip, tpt);
			else
				pnt = EllipseForward(ellip, tpt);
			pnt.X = pnt.X*scaleFactor*ellip.SemiMajorAxis + falseEasting;
			pnt.Y = pnt.Y*scaleFactor*ellip.SemiMajorAxis + falseNorthing;
			return pnt;
		}
		
		this.Inverse = function(ellip, pnt)
		{
			var tpt = CPoint3((pnt.X-falseEasting)/ellip.SemiMajorAxis/scaleFactor, (pnt.Y-falseNorthing)/ellip.SemiMajorAxis/scaleFactor, pnt.Z);
			if (ellip.es == 0)
				pnt = SpheroidInverse(ellip, tpt);
			else
				pnt = EllipseInverse(ellip, tpt);
			pnt.X = pnt.X*180/Math.PI;
			pnt.Y = pnt.Y*180/Math.PI;
			return pnt;
		}
		
		function SpheroidForward(ellip, pnt)
		{
			var lamc = longitudeOfCenter*Math.PI/180;
			var phic = latitudeOfCenter*Math.PI/180;
			var alpha = azimuth*Math.PI/180;
			var alphac = xYPlaneRotation*Math.PI/180;
			
			var lamp = Math.atan2(-Math.cos(alpha), -Math.sin(phic) * Math.sin(alpha)) + lamc + Math.PI/2;
			var phip = Math.asin(Math.cos(phic) * Math.sin(alpha));
			var salp = Math.sin(alphac);
			var calp = Math.cos(alphac);
			var sphip = Math.sin(phip);
			var cphip = Math.cos(phip);
			var slam = Math.sin(pnt.X - lamp);
			var clam = Math.cos(pnt.X - lamp);
			var sphi = Math.sin(pnt.Y);
			var cphi = Math.cos(pnt.Y);
			var A = sphip * sphi - cphip * cphi * slam;
			var u = Math.atan2(sphi / cphi * cphip + sphip * slam, clam);
			var v = -.5 * Math.log((1 + A) / (1 - A));
			var x = v * calp + u * salp;
			var y = u * calp - v * salp;
			return new CPoint3(x, y, pnt.Z);
		}
		
		function SpheroidInverse(ellip, pnt)
		{
			var lamc = longitudeOfCenter*Math.PI/180;
			var phic = latitudeOfCenter*Math.PI/180;
			var alpha = azimuth*Math.PI/180;
			var alphac = xYPlaneRotation*Math.PI/180;
			
			var lamp = lamc + Math.atan2(-Math.cos(alpha), -Math.sin(phic) * Math.sin(alpha)) + Math.PI/2;
			var phip = Math.asin(Math.cos(phic) * Math.sin(alpha));
			var salp = Math.sin(alphac);
			var calp = Math.cos(alphac);
			var sphip = Math.sin(phip);
			var cphip = Math.cos(phip);

			var x = pnt.X;
			var y = pnt.Y;
			var v = x * calp - y * salp;
			var u = y * calp + x * salp;
			var Q = Math.exp(-v);
			var S = (Q - 1 / Q) / 2;
			var T = (Q + 1 / Q) / 2;
			var V = Math.sin(u);
			var phi = Math.asin((V * cphip + S * sphip) / T);
			var lam = Math.atan2(V * sphip - S * cphip, Math.cos(u)) + lamp;
			return new CPoint3(lam, phi, pnt.Z);
		}
		
		function EllipseForward(ellip, pnt)
		{
			var es = ellip.es;
			var e = Math.sqrt(es);
		
			var lamc = longitudeOfCenter*Math.PI/180;
			var phic = latitudeOfCenter*Math.PI/180;
			var alpha = azimuth*Math.PI/180;
			var alphac = xYPlaneRotation*Math.PI/180;

			var sphic = Math.sin(phic);
			var cphic = Math.cos(phic);
			var A2 = Math.sqrt(1 - es) / (1 - es * sphic * sphic);
			var B = Math.sqrt(1 + es * cphic * cphic * cphic * cphic / (1 - es));
			var D = B * Math.sqrt(1 - es) / (cphic * Math.sqrt(1 - es * sphic * sphic));
			if (D < 1 && D > -1) D = (D > 0 ? 1 : -1);
			var F = D + Math.sqrt(D * D - 1) * (phic > 0 ? 1 : -1);
			var E = F * Math.pow(pj_tsfn(phic, sphic, e), B);
		
			var phip = Math.asin(Math.sin(alpha) / D);
			var lamp = lamc - Math.asin((F - 1 / F) / 2 * Math.tan(phip)) / B;
			var salp = Math.sin(alphac);
			var calp = Math.cos(alphac);
			var sphip = Math.sin(phip);
			var cphip = Math.cos(phip);
			
			var lam = pnt.X - lamp;
			var phi = pnt.Y;
			var t = pj_tsfn(phi, Math.sin(phi), e);
			var Q = E / Math.pow(t, B);
			var S = (Q - 1. / Q) / 2;
			var T = (Q + 1. / Q) / 2;
			var V = Math.sin(B * lam);
			var con = Math.cos(B * lam);
			var U = (S * sphip - V * cphip) / T;
			
			var u = 0;
			if (con == 0)
				u = A2 * B * B * lam;
			else
				u = A2 * Math.atan2(S * cphip + V * sphip, con);
			var v = A2 * Math.log((1. - U) / (1. + U)) / 2;
			
			var x = v * calp + u * salp;
			var y = u * calp - v * salp;
			return new CPoint3(x, y, pnt.Z);
		}
		function EllipseInverse(ellip, pnt)
		{
			var es = ellip.es;
			var e = Math.sqrt(es);
		
			var lamc = longitudeOfCenter*Math.PI/180;
			var phic = latitudeOfCenter*Math.PI/180;
			var alpha = azimuth*Math.PI/180;
			var alphac = xYPlaneRotation*Math.PI/180;

			var sphic = Math.sin(phic);
			var cphic = Math.cos(phic);
			var A2 = Math.sqrt(1 - es) / (1 - es * sphic * sphic);
			var B = Math.sqrt(1 + es * cphic * cphic * cphic * cphic / (1 - es));
			var D = B * Math.sqrt(1 - es) / (cphic * Math.sqrt(1 - es * sphic * sphic));
			if (D < 1 && D > -1) D = (D > 0 ? 1 : -1);
			var F = D + Math.sqrt(D * D - 1) * (phic > 0 ? 1 : -1);
			var E = F * Math.pow(pj_tsfn(phic, sphic, e), B);
		
			var phip = Math.asin(Math.sin(alpha) / D);
			var lamp = lamc - Math.asin((F - 1 / F) / 2 * Math.tan(phip)) / B;
			var salp = Math.sin(alphac);
			var calp = Math.cos(alphac);
			var sphip = Math.sin(phip);
			var cphip = Math.cos(phip);
		
			var x = pnt.X;
			var y = pnt.Y;
			var v = x * calp - y * salp;
			var u = y * calp + x * salp;
			var Q = Math.exp(-v / A2);
			var S = (Q - 1 / Q) / 2;
			var T = (Q + 1 / Q) / 2;
			var V = Math.sin(u / A2);
			var U = (V * cphip + S * sphip) / T;
			var phi = Math.PI / 2 * (U > 0 ? 1 : -1);
			if (Math.abs(U) < 1.)
			{
				var t = Math.pow(E / Math.sqrt((1 + U) / (1 - U)), 1 / B);
				phi = Math.PI / 2 - 2 * Math.atan(t);
				if (es != 0)
					phi = pj_iterphi(phi, es);
			}
			var lam = Math.atan2(V * sphip - S * cphip, Math.cos(u / A2)) / B + lamp;
	    
			return new CPoint3(lam, phi, pnt.Z);
		}
		return this;
	}
}
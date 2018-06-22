var request = require('retry-request', {
	request: require('request')
});
const fs = require("fs");
const key = "";

console.log(key);

let i;
i = {};

function mahalledata(mahobj, interval, i) {
	const mahalle = mahobj[i-1];
	console.log(`retrieving data for mahalle#${mahalle.id}, i: ${i}`)
	if(i <= 0) clearInterval(interval);
	request(`http://www.locationbox.com.tr/locationbox/services?Key=${key}&Cmd=GetDemographicInfo&Typ=JSON&MahalleId=${mahalle.id}&InfoType=OKUMAYAZMA`).then(function (OKUMAYAZMAerr, OKUMAYAZMAres, OKUMAYAZMAbody) {
		request(`http://www.locationbox.com.tr/locationbox/services?Key=${key}&Cmd=GetDemographicInfo&Typ=JSON&MahalleId=${mahalle.id}&InfoType=EGITIM`).then(function (EGITIMerr, EGITIMres, EGITIMbody) {
			request(`http://www.locationbox.com.tr/locationbox/services?Key=${key}&Cmd=GetDemographicInfo&Typ=JSON&MahalleId=${mahalle.id}&InfoType=NUFUS`).then(function (NUFUSerr, NUFUSres, NUFUSbody) {
				request(`http://www.locationbox.com.tr/locationbox/services?Key=${key}&Cmd=GetDemographicInfo&Typ=JSON&MahalleId=${mahalle.id}&InfoType=ARAC`).then(function (ARACerr, ARACres, ARACbody) {
					request(`http://www.locationbox.com.tr/locationbox/services?Key=${key}&Cmd=GetDemographicInfo&Typ=JSON&MahalleId=${mahalle.id}&InfoType=YASGRUPLARI`).then(function (YASGRUPLARIerr, YASGRUPLARIres, YASGRUPLARIbody) {
						request(`http://www.locationbox.com.tr/locationbox/services?Key=${key}&Cmd=GetDemographicInfo&Typ=JSON&MahalleId=${mahalle.id}&InfoType=KONUT`).then(function (KONUTerr, KONUTres, KONUTbody) {
							if (EGITIMerr || OKUMAYAZMAerr || NUFUSerr || ARACerr || YASGRUPLARIerr || KONUTerr) console.error("error in service calls");
							i--;
							const NUFUS = JSON.parse(NUFUSbody).demographic;
							const OKUMAYAZMA = JSON.parse(OKUMAYAZMAbody).demographic;
							const EGITIM = JSON.parse(EGITIMbody).demographic;
							const ARAC = JSON.parse(ARACbody).demographic;
							const YASGRUBU = JSON.parse(YASGRUPLARIbody).demographic;
							const KONUT = JSON.parse(KONUTbody).demographic;
							csv.write(
								`${mahalle}|${NUFUS}|${OKUMAYAZMA}|${EGITIM}|${KONUT}|${YASGRUBU}|${ARAC};`
							);
						});
					});
				});
			});
		});
	});
}

// THIS WILL INVALIDATE YOUR KEY IF USED REPEATEDLY
// PLEASE DON'T USE THIS WITH AND UNTHROTTLED OR FAST NETWORK

/*
OKUMAYAZMA--Literacy
EGITIM--Education
NUFUS--Population
ARAC--Vehicle Type
YASGRUPLARI--Age Groups
KONUT--Residence
*/


const csv = fs.createWriteStream("data.csv");

csv.write("mahalleid"),

request(`http://www.locationbox.com.tr/locationbox/services?Key=${key}&Cmd=IlList&Typ=JSON`, function(ilerr, ilres, ilbody) {
	if (ilerr) throw ("can't reach shit idk");
	console.log(`http://www.locationbox.com.tr/locationbox/services?Key=${key}&Cmd=IlList&Typ=JSON`);
	JSON.parse(ilbody).illist.forEach(function (il) {
		if(il.id<20) return;
		request(`http://www.locationbox.com.tr/locationbox/services?Key=${key}&Cmd=IlceList&Typ=JSON&IlId=${il.id}`, function (ilceerr, ilceres, ilcebody) {
			console.log(`http://www.locationbox.com.tr/locationbox/services?Key=${key}&Cmd=IlceList&Typ=JSON&IlId=${il.id}`);
			if (ilceerr) throw (ilceerr);
			let ilceobj;
			try {ilceobj = JSON.parse(ilcebody)}
			catch (e) {console.error(e); return}
			ilceobj.ilcelist.forEach(function (ilce) {
				request(`http://www.locationbox.com.tr/locationbox/services?Key=${key}&Cmd=MahalleList&Typ=JSON&IlceId=${ilce.id}`, function (maherr, mahres, mahbody) {
					console.log(`http://www.locationbox.com.tr/locationbox/services?Key=${key}&Cmd=MahalleList&Typ=JSON&IlceId=${ilce.id}`);
					if (maherr) throw (maherr);
					let mahobj;
					try {mahobj = JSON.parse(mahbody)}
					catch (e) {console.error(e); return}

					let interv;

					i[ilce.id] = mahobj.mahallelist.length;

					interv = setInterval(mahalledata, 3000, [mahobj.mahallelist, interv, i[ilce.id]]);

				});
			});
		});
	});
});

setTimeout(function() {csv.close()}, 10000000)
(function(window){
	
	Congress = {};
	var api_key = "890d385606f8484ba5b0e02bd838edab";
	var base_url = "https://congress.api.sunlightfoundation.com";

	var stateAbbreviations = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"]

	var formatForD3 = function(responseData){
		var allData = [];
		var bill;
		var nowYear = new Date().getFullYear();
		var allVoters = [];
		var existVoters = {};

		for (var key in responseData) {
			var response = responseData[key];
			var voteData = {};
			voteData.votes = response;
			var stateVotes = {};
			var voters = {};
			bill = bill || response.bill;
			// voteData.votes.remove("bill");

			for (var s in stateAbbreviations) {
				stateVotes[stateAbbreviations[s]] = 0;
			}

			var types = { "YeaR": "YR", "YeaI": "YI", "YeaD": "YD", "NayR": "NR", "NayI": "NI", "NayD": "ND"}
			for (var id in voteData.votes.voters) {
				var v = voteData.votes.voters[id].voter;
				
				if (existVoters[id] == undefined) {
					var obj = {	voter_id: id,
											party: v.party,
											birthday: v.birthday,
											age: nowYear - v.birthday.slice(0,4),
											chamber: v.chamber,
											district: v.district,
											name: v.first_name + " " + v.last_name,
											gender: v.gender,
											state: v.state,
											x: 350,
											y: 20,
										}
					allVoters.push(obj);
					existVoters[id] = true;
				}
				
				voters[id] = types[voteData.votes.voters[id].vote + v.party] == undefined ? "E" : types[voteData.votes.voters[id].vote + v.party];
				if (voteData.votes.voters[id].vote == "Nay") {
					stateVotes[v.state] -= 1;
				} else if (voteData.votes.voters[id].vote == "Yea") {
					stateVotes[v.state] += 1;
				}
		  }

			voteData.voters = voters;
			voteData.states = stateVotes;
			allData.push(voteData);
		};

		allData.voters = allVoters;
		allData.bill = bill;

		return allData;
	};

	// https://congress.api.sunlightfoundation.com/votes?apikey=890d385606f8484ba5b0e02bd838edab&per_page=all
	Congress.request = function(action, callback) {
		console.log("remote request");
		var full_url = base_url + "/" + action + "?apikey=" + api_key + "&per_page=all";

		$.ajax({
			url: full_url
		}).done( function(response) {
			callback(response.results);
		})
	}

	Congress.localRequest = function(fileName, callback) {
		$.getJSON("data/" + fileName + ".json", function(data){
			callback(data);
		});
	}

	Congress.getVote = function(billName, callback) {
		var voteFields = ["bill","nomination","chamber","congress","number","question","required","result","vote_type","year","voters"]
		
		var full_url = base_url + "/votes?bill_id=" + billName + "&apikey=" + api_key + "&per_page=all&fields=" + voteFields.join();
		// https://congress.api.sunlightfoundation.com/votes?bill_id=s1926-113&apikey=890d385606f8484ba5b0e02bd838edab&per_page=50&fields=bill_id,chamber,congress,number,question,required,result,roll_id,vote_type,year,voter_ids
		
		$.ajax({
			url: full_url
		}).done( function(response) {
			var d3data = formatForD3(response.results);
			callback(d3data);
		})
	};

	Congress.customVotes = function(callback) {
		var voteFields = ["bill_id","chamber","congress","number","question","required","result","roll_id","vote_type","year","voter_ids"]

		var full_url = base_url + "/votes?apikey=" + api_key + "&per_page=all&fields=" + voteFields.join();
		// https://congress.api.sunlightfoundation.com/votes?roll_id__=s19-2014&apikey=890d385606f8484ba5b0e02bd838edab&per_page=50&page=10&fields=bill_id,chamber,congress,number,question,required,result,roll_id,vote_type,year,voter_ids
		// https://congress.api.sunlightfoundation.com/votes?chamber=senate&apikey=890d385606f8484ba5b0e02bd838edab&per_page=50&fields=bill_id,chamber,congress,number,question,required,result,roll_id,vote_type,year,voter_ids

		$.ajax({
			url: full_url
		}).done( function(response) {
			callback(response.results);
		})
	}

	Congress.customLegislators = function(callback) {
		var legFields = ["bioguide_id","birthday","chamber","district","first_name","gender","last_name","leadership_role","nickname","party","state","state_rank"]

		var full_url = base_url + "/votes?apikey=" + api_key + "&per_page=all&fields=" + legFields.join();
		// https://congress.api.sunlightfoundation.com/legislators?apikey=890d385606f8484ba5b0e02bd838edab&per_page=all&fields=bioguide_id,birthday,chamber,district,first_name,gender,last_name,leadership_role,nickname,party,state,state_rank
		
		$.ajax({
			url: full_url
		}).done( function(response) {
			callback(response.results);
		})
	}

	Congress.customBills = function(callback) {
		var billFields = ["committee_ids", "bill_type", "chamber", "sponsor_id", "cosponsor_ids", "withdrawn_cosponsor_ids", "urls", "keywords", "summary", "summary_short", "nicknames", "congress", "bill_id", "official_title", "popular_title"];


		var full_url = base_url + "/bills?apikey=" + api_key + "&per_page=all&fields=" + billFields.join();
		// https://congress.api.sunlightfoundation.com/bills?apikey=890d385606f8484ba5b0e02bd838edab&per_page=50&fields=committee_ids,bill_type,chamber,sponsor_id,cosponsor_ids,withdrawn_cosponsor_ids,urls,keywords,summary,summary_short,nicknames,congress,bill_id,official_title,popular_title
		// https://congress.api.sunlightfoundation.com/bills?votes.roll_id__exists=true&apikey=890d385606f8484ba5b0e02bd838edab&per_page=50&page=10&fields=bill_type,sponsor_id,cosponsor_ids,withdrawn_cosponsor_ids,keywords,summary,nicknames,bill_id,official_title,votes.roll_id
		// https://congress.api.sunlightfoundation.com/bills?chamber=senate&votes.roll_id__exists=true&apikey=890d385606f8484ba5b0e02bd838edab&per_page=50&page=10&fields=bill_type,sponsor_id,cosponsor_ids,withdrawn_cosponsor_ids,keywords,summary,nicknames,bill_id,official_title,votes.roll_id
		$.ajax({
			url: full_url
		}).done( function(response) {
			callback(response.results);
		})
	}

	Congress.getAll = function(callback) {
		var allData = {};
		var count = 3;
		allData.states = states;
		allData.stateAbbreviations = stateAbbreviations;

		this.localRequest("legislators", function(response){
		// this.request("legislators", function(results){
			console.log("got legislators");
			count -= 1;
			allData.legislators = response.results;
			if (count == 0) { callback(allData); }
		});
		this.localRequest("vote_s19-2014", function(response){
		// this.request("votes", function(results){
			
			count -= 1;
			allData.votes = response.results[0];
			// console.log("got votes",allData.votes.voters);
			var voters = [];
			var nayers = {"R": [], "D": [], "I": []};
			var yeaers = {"R": [], "D": [], "I": []};
			var elsers = {"R": [], "D": [], "I": []};

			// var types = { "YeaR": 0, "YeaI": 1, "YeaD": 2, "NayR": 3, "NayI": 4, "NayD": 5}
			var nowYear = new Date().getFullYear();
			var types = { "YeaR": "YR", "YeaI": "YI", "YeaD": "YD", "NayR": "NR", "NayI": "NI", "NayD": "ND"}
			for (var id in allData.votes.voters) {
				// console.log("????",allData.votes.voters[id])
				var v = allData.votes.voters[id].voter;
				var obj = {	voter_id: id, 
  									value: allData.votes.voters[id].vote,
  									party: v.party,
  									birthday: v.birthday,
  									age: nowYear - v.birthday.slice(0,4),
  									chamber: v.chamber,
  									district: v.district,
  									name: v.first_name + " " + v.last_name,
  									gender: v.gender,
  									state: v.state,
  									// type: types[allData.votes.voters[id].vote + v.party] == undefined ? 6 : types[allData.votes.voters[id].vote + v.party],
  									type: types[allData.votes.voters[id].vote + v.party] == undefined ? "E" : types[allData.votes.voters[id].vote + v.party],
  									x: 350,
  									y: -20,
  								}
  			// console.log(obj.party, obj.value, obj.type, types[allData.votes.voters[id].vote + v.party])
  			voters.push(obj);
  			if (obj.value == "Nay") {
  				nayers[obj.party].push(obj);
  				allData.states[stateAbbreviations.indexOf(obj.state)].vote -= 1;
  			} else if (obj.value == "Yea") {
					yeaers[obj.party].push(obj);
					allData.states[stateAbbreviations.indexOf(obj.state)].vote += 1;
  			} else {
  				elsers[obj.party].push(obj);
  			}
		  }
		  allData.votes.voters = { "Nay": nayers, "Yea": yeaers, "Else": elsers };
		  allData.votes.allVoters = voters;

			if (count == 0) { callback(allData); }
		});
		this.localRequest("bills_senate_few", function(response){
		// this.request("bills", function(results){
			console.log("got bills");
			count -= 1;
			allData.bills = response.results;
			if (count == 0) { callback(allData); }
		});

	}

})(window)
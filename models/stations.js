const express = require("express")
const app = express()
const db =require('../db')

class Station {

    static findAll(){
        const sql = "select * from stations limit 400;"
        //const sql = "select * from stations where state = 'New South Wales';"
        return db.query(sql).then(res => res.rows )
    }

    static total_stations(){
        const sql = "select distinct owner from stations;"
        return db.query(sql)
	    .then( dbRes => { 
		    let owners = (dbRes.rows.map((owner) => owner.owner ))
		    let count = dbRes.rows.length
		    return {owners : owners, total_owners : count}
		})
    }

    static random_station(){
        const sql = 'select * from stations order by random() limit 1;'
	    return db.query(sql)
	    .then( dbRes => dbRes.rows[0] )
    }

    static in_bounds(southLat, northLat, westLng, eastLng) {
        const sql = 'select * from stations where latitude between $1 and $2 and longitude between $3 and $4;'
        return db.query(sql, [southLat, northLat, westLng, eastLng]).then(res => res.rows )
    }
    
    static stats(){
               
        const sql1 = 'select owner, count(owner) from stations group by owner having count (owner) > 1 order by count desc;'
	    const sql2 = 'select count(*) as total_stations, count(distinct owner) as total_owners from stations;'
	    	
	    let owners = db.query(sql1)
	    let total_stations = db.query(sql2)
        return Promise.all([owners , total_stations])	
        .then( dbRes => {
            let owners = dbRes[0].rows
            let total_owners = dbRes[1].rows[0].total_owners
            let total_stations = dbRes[1].rows[0].total_stations
            return {owners , total_owners , total_stations }
    })
    }

    static stations_nearby(lat, lng, radius) {
        
        const query = `
          SELECT id, name, owner, address, logo, latitude, longitude,
            earth_distance(ll_to_earth($1, $2), ll_to_earth(latitude, longitude)) AS distance
          FROM stations
          WHERE earth_box(ll_to_earth($1, $2), $3) @> ll_to_earth(latitude, longitude)
          ORDER BY distance
          LIMIT 700
        `
        return db.query(query, [lat, lng, radius * 1000]).then(res => res.rows)
    }

    static nearest_station( latitude , longitude , radius , limit ) {

        const query = `
          SELECT *, 
            (6371 * acos(
              cos(radians($1)) * cos(radians(latitude)) * cos(radians(longitude) - radians($2)) + sin(radians($1)) * sin(radians(latitude))
            )) AS distance
          FROM stations
          WHERE 
            (6371 * acos(
              cos(radians($1)) * cos(radians(latitude)) * cos(radians(longitude) - radians($2)) + sin(radians($1)) * sin(radians(latitude))
            )) <= $3
          ORDER BY distance
          LIMIT $4;
        `
        return db.query(query, [latitude, longitude, radius, limit])
          .then(dbRes => dbRes.rows)     
        
    }  
    
}


module.exports = Station
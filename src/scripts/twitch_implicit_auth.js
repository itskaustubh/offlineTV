import {streamers} from '../data/streamers'

const CLIENT_ID     = 'vod65kbxn5l31e3czznop13kkfdk7n';
const REDIRECT_URL  = 'http://localhost:8080';

const REQUEST_ACCESS_TOKEN_URL = 'https://id.twitch.tv/oauth2/authorize?client_id=' + CLIENT_ID + '&redirect_uri=' + encodeURIComponent(REDIRECT_URL) + '&response_type=token'

var ACCESS_TOKEN = ''

function authorizePublic(){
    window.location.href = REQUEST_ACCESS_TOKEN_URL;
}

function parseAccessToken(){
    if (localStorage.getItem("ACCESS_TOKEN")){
        ACCESS_TOKEN = localStorage.getItem("ACCESS_TOKEN");      
    }else if (document.location.hash && document.location.hash != '') { 
        var parsedHash = new URLSearchParams(window.location.hash.substr(1));
        if (parsedHash.get('access_token')) {
            ACCESS_TOKEN = parsedHash.get('access_token');
            localStorage.setItem("ACCESS_TOKEN", ACCESS_TOKEN); 
            window.location.hash = ''
        }
    }
}


function getUserInfo(){
    
    fetch(
        'https://api.twitch.tv/helix/users',
        {
            "headers": {
                "Client-ID": CLIENT_ID,
                "Authorization": "Bearer " + ACCESS_TOKEN
            }
        }
    )
    .then(resp => resp.json())
    .then(resp => {
        console.log('success!')
        console.log(resp.data)
        console.log(resp.data[0])
        for(var key in resp.data[0]){
            console.log(`${key} - ${resp.data[0][key]}`)
        }
    })
    .catch(err => {
        console.log('error!')
        console.log(err);
    });
}

function getStreamInfoUsingID(){

    fetch(
        'https://api.twitch.tv/helix/channels?broadcaster_id=41245072',
        {
            "headers": {
                "Client-ID": CLIENT_ID,
                "Authorization": "Bearer " + ACCESS_TOKEN
            }
        }
    )
    .then(resp => resp.json())
    .then(resp => {
        console.log('success!')
        console.log(resp.data)
        console.log(resp.data[0])
        for(var key in resp.data[0]){
            console.log(`${key} - ${resp.data[0][key]}`)
        }
    })
    .catch(err => {
        console.log('error!')
        console.log(err);
    });
}


async function getStreamInfo (){

    for (var streamer in streamers.value){
        console.log(streamer)
        await fetch(
            'https://api.twitch.tv/helix/search/channels?query=' + streamers.value[streamer]['channel_name'],
            {
                "headers": {
                    "Client-ID": CLIENT_ID,
                    "Authorization": "Bearer " + ACCESS_TOKEN
                }
            }
        )
        .then(resp => resp.json())
        .then(resp => {
            // console.log('fetched' + name)
            // console.log(resp.data)
            // console.log(resp.data[0])
            // for(var key in resp.data[0]){
            //     console.log(`${key} - ${resp.data[0][key]}`)
            // }
            let xstreamer = resp.data[0]
            streamers.value[streamer]['isLive']         = xstreamer['is_live']
            streamers.value[streamer]['title']          = xstreamer['title']
            streamers.value[streamer]['thumbnailURL']   = xstreamer['thumbnail_url']    
            streamers.value[streamer]['game_id']        = xstreamer['game_id']   
            
            if (streamers.value[streamer]['isLive']){
                getGameName(xstreamer['game_id'],streamer)   
            }else{
                streamers.value[streamer]['game_name'] = 'Offline';
            }

            console.log(streamers.value[streamer])
        })
        .catch(err => {
            console.log('error!')
            console.log(err);
        });
    }
    
}

async function getGameName(game_id,streamer){
    await fetch(
        'https://api.twitch.tv/helix/games?id=' + game_id,
        {
            "headers": {
                "Client-ID": CLIENT_ID,
                "Authorization": "Bearer " + ACCESS_TOKEN
            }
        }
    )
    .then(resp => resp.json())
    .then(resp => {
        let data = resp.data[0]
        for(var key in data){
            console.log(`${key} - ${data[key]}`)
        }
        console.log(`game name: ${data['name']}`)
        streamers.value[streamer]['game_name'] = data['name'];
    })
    .catch(err => {
        console.log('error!')
        console.log(err);
    });
}



export{
    authorizePublic,
    parseAccessToken,
    getStreamInfo
}
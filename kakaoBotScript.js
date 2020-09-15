const scriptName = "JomiC Bot";
/**
 * (string) room
 * (string) sender
 * (boolean) isGroupChat
 * (void) replier.reply(message)
 * (boolean) replier.reply(room, message, hideErrorToast = false) // 전송 성공시 true, 실패시 false 반환
 * (string) imageDB.getProfileBase64()
 * (string) packageName
 */

function getWeather(location){

    try {
        var data = org.jsoup.Jsoup.connect("https://m.search.naver.com/search.naver?query=" + location.replace(/ /g, "+") + "+날씨").get();
        data = data.select("div.weather_info");
        var status = data.select("div.weather_main").get(0).text();
        var temp = data.select("strong");
        var tempCurrent = temp.get(0).text();
        var tempMax = temp.get(1).text();
        var tempMin = temp.get(2).text();
        var tempWind = temp.get(3).text();
        var table = data.select("span.figure_text");
        if (table.size() == 6) {
            var dust = table.get(1).text();
            var hum = table.get(4).text();
        } else {
            var dust = table.get(0).text();
            var hum = table.get(3).text();
        }
        var result = "상태 : " + status + "\n";
        result += tempCurrent.replace("온도", "온도 : ") + "\n";
        result += "체감 온도 : " + tempWind + "\n";
        result += "최고 기온 : " + tempMax + "\n";
        result += "최저 기온 : " + tempMin + "\n";
        result += "습도 : " + hum + "\n";
        result += "미세먼지 : " + hum;
        return result.replace(/°/g, "℃");
    } catch (e) {
        return null;
    }
}

function getLolMatchInfo(summonerId){
    try{
        var result;
        var data = org.jsoup.Jsoup.connect("https://www.op.gg/summoner/userName=" + summonerId.replace(/ /g, "+")).get();
        
        // 솔랭 전적
        var tierRankInfo = data.select("div.TierRankInfo");
        var soloRankTier = tierRankInfo.select("div.TierRank").get(0).text();
        var tierInfo = tierRankInfo.select("div.TierInfo");
        var soloLeaguePoints = tierInfo.select("span.LeaguePoints").get(0).text();
        var soloWinLose = tierInfo.select("span.WinLose");
        var soloWin = soloWinLose.select("span.wins").get(0).text();
        var soloLosses = soloWinLose.select("span.losses").get(0).text();
        var soloWinRatio = soloWinLose.select("span.winratio").get(0).text();

        // 자랭 전적
        var subTierInfo = data.select("div.sub-tier");
        var subRankTier = subTierInfo.select("div.sub-tier__rank-tier ").get(0).text();
        var subTierLeaguePoints = subTierInfo.select("div.sub-tier__league-point").get(0).text();
        subTierLeaguePoints.replace(/(<([^>]+)>)/ig,"");
        var subTierWinRatio = subTierInfo.select("div.sub-tier__gray-text").get(0).text();

        // 모스트 챔피언 정보
        var mostChampionContent = data.select("div.MostChampionContent");
        var championInfo = mostChampionContent.select("div.ChampionInfo");
        var personalKDA = mostChampionContent.select("div.PersonalKDA");
        var played = mostChampionContent.select("div.Played");

        var re = new RegExp("ChampionName", "g");
        var mostCnt = championInfo.toString().match(re);
        var mostChampionName = new Array();
        var mostChampionCs = new Array();
        var mostChampionKDA = new Array();
        var mostChampionWinRatio = new Array();

        if(mostCnt != null){
            for(var i = 0; i < mostCnt.length; i++){
                mostChampionName[i] = championInfo.select("div.ChampionName").get(i).text();
                mostChampionCs[i] = championInfo.select("div.ChampionMinionKill").get(i).text();
                mostChampionKDA[i] = personalKDA.select("span.KDA").get(i).text();
                mostChampionWinRatio[i] = played.select("div.Played").get(i).text();
            }
        }

        // 최근게임 평균
        var gameAverageStats = data.select("table.GameAverageStats");
        var winRatioTitle = gameAverageStats.select("div.WinRatioTitle");
        var total = winRatioTitle.select("span.total").get(0).text();
        var win = winRatioTitle.select("span.win").get(0).text();
        var lose = winRatioTitle.select("span.lose").get(0).text();
        var kdaAverage = gameAverageStats.select("div.KDA");
        var kdaRatioAverage = gameAverageStats.select("div.KDARatio").get(0).text();
        var averageKill = kdaAverage.select("span.Kill").get(0).text();
        var averageDeath = kdaAverage.select("span.Death").get(0).text();
        var averageAssist = kdaAverage.select("span.Assist").get(0).text();

        // 최근게임 전적
        var gameItemList = data.select("div.GameItemList");
        var gameItemWrap = gameItemList.select("div.GameItemWrap");
        var re2 = new RegExp("GameItemWrap", "g");
        var gameListCnt = gameItemList.toString().match(re2);
        var gameItemType = new Array();
        var gameItemResult = new Array();
        var gameItemTimeStamp = new Array();
        var gameItemLength = new Array();
        var gameItemSpell = new Array();
        var gameItemRunes = new Array();
        var gameItemKDA = new Array();
        var gameItemKDARatio = new Array();
        var gameItemMultiKill = new Array();
        var gameItemStats = new Array();
        var gameItemItemList = new Array();
        var gameItemWard = new Array();
        var gameItemChampion = new Array();

        if(gameListCnt != null){
            for(var k = 0; k < gameListCnt.length; k++){
                var gameListKDA = gameItemWrap.select("div.KDA").get(k);
                // 게임 타입 판별
                if(gameItemWrap.select("div.GameType").get(k).text() != null){
                    var gameTypeStr = gameItemWrap.select("div.GameType").get(k).text();
                    if(gameTypeStr == "Flex 5:5 Rank"){
                        gameItemType[k] = "자유랭크";
                    }else if(gameTypeStr == "Ranked Solo"){
                        gameItemType[k] = "솔로랭크";
                    }else if(gameTypeStr == "ARAM"){
                        gameItemType[k] = "무작위 총력전";
                    }else{
                        gameItemType[k] = "일반";
                    }
                }
                gameItemTimeStamp[k] = gameItemWrap.select("div.TimeStamp").get(k).text();
                // 게임 승리 판별
                if(gameItemWrap.select("div.GameResult").get(k).text() != null){
                    var gameItemWinTypeStr = gameItemWrap.select("div.GameResult").get(k).text();
                    if(gameItemWinTypeStr == "Victory"){
                        gameItemResult[k] = "승리";
                    }else{
                        gameItemResult[k] = "패배";
                    }
                }
                gameItemLength[k] = gameItemWrap.select("div.GameLength").get(k).text();
                gameItemKDA[k] = gameListKDA.select("div.KDA").text();
                gameItemKDARatio[k] = gameListKDA.select("div.KDARatio").text();
                gameItemMultiKill[k] = gameListKDA.select("div.MultiKill").text();
                gameItemStats[k] = gameItemWrap.select("div.Stats").get(k).text();
                gameItemChampion[k] = gameItemWrap.select("div.ChampionName").get(k).text();
            }
        }

        result = "솔로랭크 : " + soloRankTier + " " + soloLeaguePoints + "/ " + soloWin + " " + soloLosses + soloWinRatio.replace("Win Ratio", " ") + "\n";
        result += "자유랭크 : " + subRankTier + " " + subTierLeaguePoints + subTierWinRatio.replace("Win Rate", " ") + "\n";
        if(mostChampionName.length != 0){
            result += "--------------------" + "\n";
            result += "모스트챔피언" + "\n";
            for(var j = 0; j < mostChampionName.length; j++){
                result += champEngToKor(mostChampionName[j]) + " " + mostChampionCs[j] + " " + mostChampionKDA[j] + " " + mostChampionWinRatio[j] + "\n";
            }
            result += "--------------------" + "\n";
        }
        result += "--------------------" + "\n";
        result += "최근전적" + "\n";
        result += "총 " + total + "전 " + win + "승 " + lose + "패" + "\n";
        result += "(" + averageKill + " / " + averageDeath + " / " + averageAssist + ")" + "\n";
        result += kdaRatioAverage + "\n";
        result += "최근게임" + "\n";
        if(gameItemType.length != 0){
            for(var l = 0; l < 5; l++){
                result += gameItemType[l] + " " + gameItemResult[l] + " " + gameItemLength[l] + " " + champEngToKor(gameItemChampion[l]) + " " + gameItemKDA[l] + " ";
                result += gameItemKDARatio[l] + " " + gameItemMultiKill[l] + " " + gameItemStats[l] + " " + gameItemTimeStamp[l] + "\n";
            }
        }
        result += "--------------------" + "\n";

        return result;
    }catch(e){
        return null;
    }
}

function getNaverSearchRanking(){
    try{
        var result = "";
        var data = org.jsoup.Jsoup.connect("https://datalab.naver.com/keyword/realtimeList.naver?age=20s&entertainment=2&groupingLevel=4&news=2&sports=2&where=main").get();
        var rankingBox = data.select("div.ranking_box");
        
        for(var i = 0; i < 20; i++){
            if(i == 19){
                result += rankingBox.select("span.item_num").get(i).text() + "위 " + rankingBox.select("span.item_title").get(i).text();
            }else{
                result += rankingBox.select("span.item_num").get(i).text() + "위 " + rankingBox.select("span.item_title").get(i).text() + "\n";
            }
        }       

        return result;
    }catch(e){
        return null;
    }
}

function getLottoNumber(){
    try{
        var result = "";
        var lotto = new Array(6);
        var count = 0;
        var overl = true;
 
        while (count < 6) {
            var number = 0;
            number = parseInt(Math.random() * 45) + 1;
 
            for (var i = 0; i < count; i++) {
                if (lotto[i] == number) {
                    overl = false;
                }
            }
 
            if (overl) {
                lotto[count] = number;
                count++;
            }
 
            overl = true;
        }

        result += lotto[0] + ", " + lotto[1] + ", " + lotto[2] + ", " + lotto[3] + ", " + lotto[4] + ", " + lotto[5];

        return result;
    }catch(e){
        return null;
    }
}

function getRandomNumber(){
    try{
        var result = "";
        number = parseInt(Math.random() * 6) + 1;
        return number;
    }catch(e){
        return null;
    }
}

function getFortune(constellation){
    try{
        var data = org.jsoup.Jsoup.connect("https://m.search.naver.com/search.naver?query=" + constellation.replace(/ /g, "+") + "+운세").get();
        var result = "";
        var infors = data.select("div._flickingContainer");
        infors.select("strong").remove();
        var today = infors.select("p.text_box").get(0).text();
        var tomorrow = infors.select("p.text_box").get(1).text();
        var week = infors.select("p.text_box").get(2).text();
        var month = infors.select("p.text_box").get(3).text();

        result += "[오늘의 운세]" + "\n";
        result += today + "\n\n";
        result += "[내일의 운세]" + "\n";
        result += tomorrow + "\n\n";
        result += "[이주의 운세]" + "\n";
        result += week + "\n\n";
        result += "[이달의 운세]" + "\n";
        result += month;
        
        return result;
    }catch(e){
        return null;
    }
}

function getCoronaStatus(){
    try{
        var data = org.jsoup.Jsoup.connect("https://m.search.naver.com/search.naver?query=코로나19국내현황").get();
        var result = "";
        var statusInfo = data.select("div.status_info");
        // 확진환자
        var info1 = statusInfo.select("li.info_01");
        // 검사진행
        var info2 = statusInfo.select("li.info_02");
        // 격리해제
        var info3 = statusInfo.select("li.info_03");
        // 사망자
        var info4 = statusInfo.select("li.info_04");
        result += "[확진환자]" + "\n" + info1.select("p.info_num").text() + "명\n";
        result += "[검사진행]" + "\n" + info2.select("p.info_num").text() + "명\n";
        result += "[격리해제]" + "\n" + info3.select("p.info_num").text() + "명\n";
        result += "[사망자]" + "\n" + info4.select("p.info_num").text() + "명";

        return result;
    }catch(e){
        return null;
    }
}

function getKorSongChart(){
    try{
        var data = org.jsoup.Jsoup.connect("https://www.genie.co.kr/chart/top200").get();
        var result = "";
        var songTable = data.select("table.list-wrap");
        var songTableTbody = songTable.select("tbody");
        var songList = songTableTbody.select("tr");
        var re = new RegExp("number", "g");
        var songCnt = songList.toString().match(re);
        var songNameArray = new Array();
        var artistArray = new Array();

        for(var i = 0; i < songCnt.length; i++){
            var info = songList.select("td.info").get(i);
            songNameArray[i] = info.select("a.title").text();
            artistArray[i] = info.select("a.artist").text();
            result += i+1 + "위 " + artistArray[i] + " - " + songNameArray[i];
            if(i != 49){
                result += "\n";
            }
        }
        return result;
    }catch(e){
        return null;
    }
}

function getEngSongChart(){

}

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {

    var cmd = msg.split(" ")[0];
    var data = msg.replace(cmd + " ", "");
    if (cmd == "/날씨") {
        var result = getWeather(data);

        if (result == null) replier.reply("그만 안하면 평생 솔로");
        else replier.reply("[" + data + " 날씨 정보]\n" + result);
    }else if(cmd == "/롤전적"){
        if(data == cmd){
            replier.reply('https://www.op.gg/');
        }else{
            var lolResult = getLolMatchInfo(data);
            if(lolResult == null){
                replier.reply(data + "의 전적정보를 불러올 수 없습니다.");
            }else{
                replier.reply("[" + data + "] 의 전적정보\n" + lolResult);
            }
        }
    }else if(cmd == '/옵지'){
        if(data == cmd){
            replier.reply('https://www.op.gg');
        }else{
            replier.reply('https://www.op.gg/summoner/userName='+data);
        }
    }else if(cmd == '/롤체'){
        if(data == cmd){
            replier.reply('https://lolchess.gg/');
        }else{
            replier.reply('https://lolchess.gg/profile/kr/'+data);
        }
    }else if(cmd == '/명령어'){
        var cmdResultMsg = '/날씨 지역' + '\n';
        cmdResultMsg += '/옵지' + '\n';
        cmdResultMsg += '/옵지 소환사명' + '\n';
        cmdResultMsg += '/롤전적 소환사명' + '\n';
        cmdResultMsg += '/롤체' + '\n';
        cmdResultMsg += '/롤체' + '\n';
        cmdResultMsg += '/실검' + '\n';
        cmdResultMsg += '/로또' + '\n';
        cmdResultMsg += '/주사위' + '\n';
        cmdResultMsg += '/이름' + '\n';
        cmdResultMsg += '/운세 별자리' + '\n';
        cmdResultMsg += '/코로나' + '\n';
        cmdResultMsg += '/국내음원차트';
        replier.reply(cmdResultMsg);
    }else if(cmd == '/로또'){
        var lottoResult = getLottoNumber();
        replier.reply("[로또 랜덤 번호]\n" + lottoResult);
    }else if(cmd == '/주사위'){
        var randomNumber = getRandomNumber();
        replier.reply("[주사위]\n" + randomNumber);
    }else if(cmd == '/실검'){
        var naverSearchRanking = getNaverSearchRanking();
        replier.reply("[네이버 실시간검색어 랭킹]\n" + naverSearchRanking);
    }else if(cmd == '/제작자'){
        replier.reply("[제작자]\n" + "JomiC");
    }else if(cmd == '/운세'){
        var fortune = getFortune(data);
        if(fortune != null){
            replier.reply("[" + data + "의 운세]\n" + fortune);
        }else{
            replier.reply("이상한거 입력하지 마라");
        }
    }else if(cmd == '/코로나'){
        var corona = getCoronaStatus();
        replier.reply("[코로나19 국내현황]\n" + corona);
    }else if(cmd == '/국내음원차트'){
        var korSongChart = getKorSongChart();
        replier.reply("[지니뮤직 국내음원차트]\n" + korSongChart);
    }
}

function champEngToKor(name){
    var result;

    switch(name){
        case 'Garen': result = '가렌'; break; case 'Galio': result = '갈리오'; break; case 'Gangplank': result = '갱플랭크'; break; case 'Gragas': result = '그라가스'; break;
        case 'Graves': result = '그레이브즈'; break; case 'Gnar': result = '나르'; break; case 'Nami': result = '나미'; break; case 'Nasus': result = '나서스'; break;
        case 'Nautilus': result = '노틸러스'; break; case 'Nocturne': result = '녹턴'; break; case 'Nunu': result = '누누와 월럼프'; break; case 'Nidalee': result = '니달리'; break;
        case 'Neeko': result = '니코'; break; case 'Darius': result = '다리우스'; break; case 'Diana': result = '다이애나'; break; case 'Draven': result = '드레이븐'; break;
        case 'Ryze': result = '라이즈'; break; case 'Rakan': result = '라칸'; break; case 'Rammus': result = '람머스'; break; case 'Lux': result = '럭스'; break; case 'Rumble': result = '럼블'; break;
        case 'Renekton': result = '레넥톤'; break; case 'Leona': result = '레오나'; break; case 'Reksai': result = '렉사이'; break; case 'Rengar': result = '렝가'; break;
        case 'Lucian': result = '루시안'; break; case 'Lulu': result = '룰루'; break; case 'Leblanc': result = '르블랑'; break; case 'Lee Sin': result = '리 신'; break;
        case 'Riven': result = '리븐'; break; case 'Lissandra': result = '리산드라'; break; case 'Master Yi': result = '마스터 이'; break; case 'Maokai': result = '마오카이'; break;
        case 'Malzahar': result = '말자하'; break; case 'Malphite': result = '말파이트'; break; case 'Mordekaiser': result = '모데카이저'; break; case 'Morgana': result = '모르가나'; break;
        case 'Drmundo': result = '문도박사'; break; case 'Miss Fortune': result = '미스 포츈'; break; case 'Bard': result = '바드'; break; case 'Varus': result = '바루스'; break;
        case 'Vi': result = '바이'; break; case 'Veigar': result = '베이가'; break; case 'Vayne': result = '베인'; break; case 'Velkoz': result = '벨코즈'; break;
        case 'Volibear': result = '볼리베어'; break; case 'Braum': result = '브라움'; break; case 'Brand': result = '브랜드'; break; case 'Vladimir': result = '블라디미르'; break;
        case 'Blitzcrank': result = '블리츠크랭크'; break; case 'Viktor': result = '빅토르'; break; case 'Poppy': result = '뽀삐'; break; case 'Sion': result = '사이온'; break;
        case 'Sylas': result = '사일러스'; break; case 'Shaco': result = '샤코'; break; case 'Senna': result = '세나'; break; case 'Sejuani': result = '세주아니'; break;
        case 'Sett': result = '세트'; break; case 'Sona': result = '소나'; break; case 'Soraka': result = '소라카'; break; case 'Shen': result = '쉔'; break;
        case 'Shyvana': result = '쉬바나'; break; case 'Swain': result = '스웨인'; break; case 'Skarner': result = '스카너'; break; case 'Sivir': result = '시비르'; break;
        case 'Xin Zhao': result = '신 짜오'; break; case 'Syndra': result = '신드라'; break; case 'Singed': result = '신지드'; break; case 'Thresh': result = '쓰레쉬'; break;
        case 'Ahri': result = '아리'; break; case 'Amumu': result = '아무무'; break; case 'Aurelionsol': result = '아우렐리온 솔'; break; case 'Ivern': result = '아이번'; break;
        case 'Azir': result = '아지르'; break; case 'Akali': result = '아칼리'; break; case 'Aatrox': result = '아트록스'; break; case 'Aphelios': result = '아펠리오스'; break;
        case 'Alistar': result = '알리스타'; break; case 'Annie': result = '애니'; break; case 'Anivia': result = '애니비아'; break; case 'Ashe': result = '애쉬'; break;
        case 'Yasuo': result = '야스오'; break; case 'Ekko': result = '에코'; break; case 'Elise': result = '엘리스'; break; case 'MonkeyKing': result = '오공'; break;
        case 'Orrn': result = '오른'; break; case 'Orianna': result = '오리아나'; break; case 'Olaf': result = '올라프'; break; case 'Yorick': result = '요릭'; break;
        case 'Udyr': result = '우디르'; break; case 'Urgot': result = '우르곳'; break; case 'Warwick': result = '워윅'; break; case 'Yummi': result = '유미'; break;
        case 'Irelia': result = '이렐리아'; break; case 'Evelynn': result = '이블린'; break; case 'Ezreal': result = '이즈리얼'; break; case 'Illaoi': result = '일라오이'; break;
        case 'Jarvaniv': result = '자르반 4세'; break; case 'Xayah': result = '자야'; break; case 'Zyra': result = '자이라'; break; case 'Zac': result = '자크'; break;
        case 'Janna': result = '잔나'; break; case 'Jax': result = '잭스'; break; case 'Zed': result = '제드'; break; case 'Xerath': result = '제라스'; break;
        case 'Jayce': result = '제이스'; break; case 'Zoe': result = '조이'; break; case 'Ziggs': result = '직스'; break; case 'Jhin': result = '진'; break;
        case 'Zilean': result = '질리언'; break; case 'Jinx': result = '징크스'; break; case 'Chogath': result = '초가스'; break; case 'Karma': result = '카르마'; break;
        case 'Camille': result = '카밀'; break; case 'Kassadin': result = '카사딘'; break; case 'Karthus': result = '카서스'; break; case 'Cassiopeia': result = '카시오페아'; break;
        case 'Kai\'Sa': result = '카이사'; break; case 'Kha\'Zix': result = '카직스'; break; case 'Katarina': result = '카타리나'; break; case 'Kalista': result = '칼리스타'; break;
        case 'Kennen': result = '케넨'; break; case 'Caitlyn': result = '케이틀린'; break; case 'Kayn': result = '케인'; break; case 'Kayle': result = '케일'; break;
        case 'Kogmaw': result = '코그모'; break; case 'Corki': result = '코르키'; break; case 'Quinn': result = '퀸'; break; case 'Kled': result = '클레드'; break;
        case 'Qiyana': result = '키아나'; break; case 'Kindred': result = '킨드레드'; break; case 'Taric': result = '타릭'; break; case 'Talon': result = '탈론'; break;
        case 'Taliyah': result = '탈리야'; break; case 'Tahmkench': result = '탐 켄치'; break; case 'Trundle': result = '트런들'; break; case 'Tristana': result = '트리스타나'; break;
        case 'Tryndamere': result = '트린다미어'; break; case 'Twistedfate': result = '트위스티드 페이트'; break; case 'Twitch': result = '트위치'; break; case 'Teemo': result = '티모'; break;
        case 'Pyke': result = '파이크'; break; case 'Pantheon': result = '판테온'; break; case 'Fiddlesticks': result = '피들스틱'; break; case 'Fiora': result = '피오라'; break;
        case 'Fizz': result = '피즈'; break; case 'Heimerdinger': result = '하이머딩거'; break; case 'Hecarim': result = '헤카림'; break;
        default: result = name;
    }
    
    return result;
}

//아래 4개의 메소드는 액티비티 화면을 수정할때 사용됩니다.
function onCreate(savedInstanceState, activity) {
  var textView = new android.widget.TextView(activity);
  textView.setText("Hello, World!");
  textView.setTextColor(android.graphics.Color.DKGRAY);
  activity.setContentView(textView);
}

function onStart(activity) {}

function onResume(activity) {}

function onPause(activity) {}

function onStop(activity) {}

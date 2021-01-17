var express = require("express");
var app = express();

app.use(express.json());
app.use(express.static(__dirname + "/public"));
const myKEY = "ace10611f290b696eaae9939138256b4";

app.get("/kaka/:lat/:long", (req, res) => {
  var lat = req.params.lat;
  var long = req.params.long;
  res.send(`
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>Kakao 지도 시작하기</title>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.8.2/css/all.min.css"
      />
      <link rel="stylesheet" href="/css/master.css">
    </head>
    <body>
      <div class="container">
        <div id="map">
          <i class="fas fa-home"></i>
          <button id="delivery-possible">배송 가능 지역 보기</button>
        </div>
        <div class="bottom">
          <h3 class="display-address">
            지도를 움직여 배달받을 위치를 지정해주세요.
          </h3>
          <button class="submit" disabled>이 위치로 배달받기</button>
        </div>
      </div>
      <script
        type="text/javascript"
        src="//dapi.kakao.com/v2/maps/sdk.js?appkey=${myKEY}&libraries=services"
      ></script>
    <script>
      var container = document.getElementById("map");
      const deliveryPossibleBtn = document.querySelector("#delivery-possible");
      const submitButton = document.querySelector(".submit");
      const address = document.querySelector(".display-address");
      const rejectMessage = "배송이 불가능한 지역입니다.";
      const errorMessage = "정확한 위치에 맞춰주세요.";

      let selectedAddress;
      let selectedPostCode;
      //지도 세팅
      var availableArea = [
        new kakao.maps.LatLng(37.52, 127.2),
        new kakao.maps.LatLng(37.3383361, 127.2),
        new kakao.maps.LatLng(37.3383361, 127.046518),
        new kakao.maps.LatLng(37.52, 127.046518),
      ];

      var icon = new kakao.maps.MarkerImage(
        "/symbol.png",
        new kakao.maps.Size(50, 50),
        {
          offset: new kakao.maps.Point(16, 34),
          alt: "",
          shape: "poly",
          coords: "1,20,1,9,5,2,10,0,21,0,27,3,30,9,30,20,17,33,14,33",
        }
      );
      // 마커가 표시될 위치입니다
      var farmPosition = new kakao.maps.LatLng(37.4283361, 127.146518);

      const lat = ${lat};
      const long = ${long};

      init(lat, long);

      function init(lat, long) {
        let isAvailable = false;

        var options = {
          center: new kakao.maps.LatLng(lat, long),
          level: 1,
          draggable: true,
          scrollwheel: true,
          disableDoubleClick: false,
          disableDoubleClickZoom: false,
        };
        var map = new kakao.maps.Map(container, options);
        var geocoder = new kakao.maps.services.Geocoder();

        //배송 가능한 지역을 먼저 그립니다.
        var polygon = new kakao.maps.Polygon({
          map: map,
          path: [availableArea],
          strokeWeight: 2,
          strokeColor: "#91D833",
          strokeOpacity: 1,
          fillColor: "#91D833",
          fillOpacity: 0.1,
        });

        // 마커를 생성합니다
        var mainMarker = new kakao.maps.Marker({
          position: farmPosition,
          image: icon,
        });
        // 마커가 지도 위에 표시되도록 설정합니다
        mainMarker.setMap(map);

        //맵 초기 세팅이 끝났습니다.

        var callback = function (result, status) {
          if (status === kakao.maps.services.Status.OK) {
            try {
              selectedAddress = result[0].road_address.address_name;
              selectedPostCode = result[0].road_address.zone_no;
              address.innerText = selectedAddress;
              submitButton.disabled = false;
            } catch {
              submitButton.disabled = true;
              address.innerText = errorMessage;
            }
          } else {
            submitButton.disabled = true;
            address.innerText = "오류가 발생했습니다.";
          }
        };

        kakao.maps.event.addListener(map, "mouseup", function (mouseEvent) {
          if (isAvailable === true) {
            var position = map.getCenter();
            console.log(position);
            geocoder.coord2Address(position.La, position.Ma, callback);
            isAvailable = false;
          } else {
            address.innerText = rejectMessage;
          }
        });

        kakao.maps.event.addListener(
          polygon,
          "mousemove",
          function (mouseEvent) {
            isAvailable = true;
          }
        );

        kakao.maps.event.addListener(polygon, "click", function (mouseEvent) {
          isAvailable = true;
        });
      }

      deliveryPossibleBtn.addEventListener("click", () => {
        address.innerText = "지도를 움직여 배달받을 위치를 지정해주세요.";
        init(37.4283361, 127.146518);
      });

      submitButton.addEventListener("click", () => {
        sendDataToFlutter();
      });

      function sendDataToFlutter() {
        const data = {
          address: selectedAddress,
          postCode: selectedPostCode,
        };

        jschannel.postMessage(JSON.stringify(data));
      }
    </script>
  </body>
</html>
`);
});

app.listen(3000, () => {
  console.log("3000");
});

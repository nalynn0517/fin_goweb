document.addEventListener('DOMContentLoaded', function() {
    kakao.maps.load(function() {
        var mapContainer = document.getElementById('map'); // 지도를 표시할 div 
        var mapOption = { 
            center: new kakao.maps.LatLng(37.5665, 126.9780), // 지도의 중심좌표
            level: 3 // 지도의 확대 레벨
        };

        var map = new kakao.maps.Map(mapContainer, mapOption); // 지도 생성
        
        // 지도 확대 축소를 제어할 수 있는 줌 컨트롤 생성
        var zoomControl = new kakao.maps.ZoomControl();
        map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

        var markers = {};
       
        var bounds = new kakao.maps.LatLngBounds(); 

        var regionBtns = document.getElementsByClassName('regionBtn');
        for (var i = 0; i < regionBtns.length; i++) {
            regionBtns[i].addEventListener('click', function() {
                var region = this.getAttribute('data-region');
                moveMapToRegion(region);
            });
        }

        // 검색 버튼 이벤트 처리
        var searchBtn = document.getElementById('searchBtn');
        searchBtn.addEventListener('click', function() {
            var keyword = document.getElementById('searchInput').value;
            searchCafe(keyword);
        });

        // 전역 변수로 infoWindow 선언
        var infoWindow = new kakao.maps.InfoWindow();

        // 선택한 지역으로 지도 이동 및 마커 표시 함수
        function moveMapToRegion(region) {
            bounds = new kakao.maps.LatLngBounds(); // bounds 변수 초기화
            map.setCenter(coords[region].position);
            map.setLevel(4); // 지도의 확대 레벨 설정

            if (markers[region]) {
                markers[region].forEach(function(marker) {
                    marker.setMap(map); // 마커를 지도에 표시
                });
            } else {
                markers[region] = [];
            }

            coords[region].cafes.forEach(function(cafe) {
                var markerImage = new kakao.maps.MarkerImage(
                    coords[region].image.src,
                    coords[region].image.size
                );

                var marker = new kakao.maps.Marker({
                    position: cafe.position,
                    map: map,
                    title: cafe.title,
                    image: markerImage
                });

                markers[region].push(marker);
                bounds.extend(cafe.position);

                
                // 인포윈도우 생성 및 내용 설정
                var content =
                    '<div class="info-window">' +
                    '   <div class="title-close-container">' +
                    '       <div class="title">' + cafe.title + '</div>' +
                    '       <div class="close-button">닫기</div>' +
                    '   </div>' +
                    '   <div class="address">' + cafe.address + '</div>' +
                    '   <div class="phone">' + cafe.phone + '</div>' +
                    '</div>';

                // 마커 클릭 시 인포윈도우 열기
                kakao.maps.event.addListener(marker, 'click', function() {
                    if (infoWindow.getMap()) { // 이미 다른 인포윈도우가 열려있는 경우
                        infoWindow.close(); // 이전 인포윈도우 닫기
                    }

                    infoWindow.setContent(content); // 인포윈도우 내용 설정
                    infoWindow.open(map, marker);

                    // 닫기 버튼 클릭 시 인포윈도우 닫기
                    var closeButton = document.querySelector('.info-window .close-button');
                    closeButton.addEventListener('click', function() {
                        infoWindow.close();
                    });
                });
            });

            map.setBounds(bounds);
        }

        // 카페 검색 함수
        function searchCafe(keyword) {
            var searchKeyword = keyword.trim().toLowerCase();
            var searchMarkers = [];
            var searchBounds = new kakao.maps.LatLngBounds(); // 검색 결과를 담을 bounds 객체 생성

            // 이전에 표시된 모든 마커 제거
            for (var region in markers) {
                markers[region].forEach(function(marker) {
                    marker.setMap(null);
                });
            }
            markers = {}; // markers 객체 재설정

            for (var region in coords) {
                coords[region].cafes.forEach(function(cafe) {
                    var cafeTitle = cafe.title.toLowerCase(); // 검색 기능의 정확도 증가를 위해 적용

                    if (cafeTitle.includes(searchKeyword)) { // 부분 일치 검색
                        var markerImage = new kakao.maps.MarkerImage(
                            coords[region].image.src,
                            coords[region].image.size
                        );

                        var marker = new kakao.maps.Marker({
                            position: cafe.position,
                            map: map,
                            title: cafe.title,
                            image: markerImage
                        });

                        searchMarkers.push(marker);
                        if (!markers[region]) {
                            markers[region] = [];
                        }
                        markers[region].push(marker);
                        searchBounds.extend(cafe.position); // 검색 결과의 위치를 searchBounds에 추가
                    }
                });
            }

            if (searchMarkers.length === 0) {
                alert("검색 결과가 없습니다.");
                map.setBounds(bounds); // 검색 결과가 없을 때 기존의 지도 범위로 돌아감
            } else {
                map.setBounds(searchBounds);
                map.setLevel(20);

                // 검색 결과가 있을 때에만 마커와 인포윈도우 생성
                searchMarkers.forEach(function(marker) {
                    var content =
                        '<div class="info-window">' +
                        '   <div class="title-close-container">' +
                        '       <div class="title">' + marker.getTitle() + '</div>' +
                        '       <div class="close-button">닫기</div>' +
                        '   </div>' +
                        '   <div class="address">' + marker.getPosition() + '</div>' +
                        '   <div class="phone">전화번호</div>' +
                        '</div>';

                    var infoWindow = new kakao.maps.InfoWindow({
                        content: content
                    });

                    // 마커 클릭 시 인포윈도우 열기
                    kakao.maps.event.addListener(marker, 'click', function() {
                        if (infoWindow.getMap()) { // 이미 다른 인포윈도우가 열려있는 경우
                            infoWindow.close(); // 이전 인포윈도우 닫기
                        }

                        infoWindow.setContent(content); // 인포윈도우 내용 설정
                        infoWindow.open(map, marker);

                        // 닫기 버튼 클릭 시 인포윈도우 닫기
                        var closeButton = document.querySelector('.info-window .close-button');
                        closeButton.addEventListener('click', function() {
                            infoWindow.close();
                        });
                    });
                });
            }
        }
    });
});
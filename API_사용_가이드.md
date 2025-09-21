# 🚀 공공데이터 API 연동 가이드

## **1단계: 공공데이터 포털에서 API 키 발급**

### **접속 및 회원가입**
1. **사이트**: https://data.go.kr
2. **회원가입/로그인**
3. **개발자센터** → **오픈API** 메뉴

### **API 신청**
1. **검색**: "대기질", "교통", "에너지" 등 검색
2. **API 선택**: 원하는 데이터의 API 선택
3. **신청**: 사용 목적, 사용량 등 입력 후 신청
4. **승인 대기**: 보통 1-2일 소요
5. **API 키 발급**: 승인 후 인증키 발급

## **2단계: 환경변수 설정**

### **백엔드 폴더에 .env 파일 생성**
```bash
# backend/.env 파일 생성
AIR_QUALITY_API_KEY=발급받은_대기질_API_키
TRANSPORT_API_KEY=발급받은_교통_API_키
ENERGY_API_KEY=발급받은_에너지_API_키
WEATHER_API_KEY=발급받은_날씨_API_키
```

## **3단계: API 테스트**

### **브라우저에서 테스트**
```
http://localhost:8000/api/statistics/test/public-data/서울
```

### **응답 예시**
```json
{
  "region": "서울",
  "test_results": {
    "air_quality": {
      "region": "서울",
      "air_quality_index": 75,
      "pm10": 45.0,
      "pm25": 25.0,
      "status": "success"
    },
    "transport": {
      "region": "서울",
      "subway_usage": 85.2,
      "bus_usage": 78.5,
      "status": "success"
    }
  },
  "status": "success"
}
```

## **4단계: 실제 API 연동**

### **현재 구현된 기능들**
- ✅ **대기질 정보**: 실시간 대기질 지수
- ✅ **교통 이용률**: 지하철, 버스, 자전거 이용률
- ✅ **에너지 사용량**: 전력, 가스, 재생에너지 비율
- ✅ **날씨 정보**: 온도, 습도, 풍속, 기압
- ✅ **종합 환경 지수**: 모든 데이터를 종합한 지수

### **API 엔드포인트들**
```
GET /api/statistics/regional/{region}     # 지역별 통계 (공공데이터 연동)
GET /api/statistics/test/public-data/{region}  # API 테스트
```

## **5단계: 프론트엔드에서 확인**

### **대시보드에서 확인**
1. **프론트엔드 실행**: `npm start`
2. **대시보드 접속**: http://localhost:3000
3. **데이터 분석 섹션**: "상세 분석 보기" 클릭
4. **지역별 환경 지수**: 실시간 데이터 확인

## **6단계: 커스터마이징**

### **새로운 API 추가**
```python
# backend/utils/public_data_api.py에 추가
def get_new_data(self, region: str) -> Dict[str, Any]:
    """새로운 공공데이터 API 추가"""
    try:
        url = "새로운_API_엔드포인트"
        params = {
            "serviceKey": self.api_keys["new_api"],
            "region": region
        }
        response = requests.get(url, params=params)
        # 데이터 처리 로직
        return processed_data
    except Exception as e:
        return self._get_default_new_data(region)
```

### **환경변수 추가**
```bash
# .env 파일에 추가
NEW_API_KEY=새로운_API_키
```

## **7단계: 에러 처리**

### **API 실패 시 기본값 사용**
- 모든 API 호출에 try-catch 적용
- 실패 시 현실적인 기본값 반환
- 로그에 에러 기록

### **캐싱 적용 (선택사항)**
```python
# Redis 캐싱으로 API 호출 최적화
import redis
redis_client = redis.Redis(host='localhost', port=6379, db=0)

def get_cached_data(key: str, ttl: int = 3600):
    cached = redis_client.get(key)
    if cached:
        return json.loads(cached)
    return None
```

## **8단계: 모니터링**

### **API 상태 확인**
- 정기적인 API 호출 테스트
- 응답 시간 모니터링
- 에러율 추적

### **로그 확인**
```bash
# 백엔드 로그에서 API 호출 상태 확인
tail -f backend/logs/api.log
```

## **🎯 추천 API 목록**

### **환경부**
- **대기환경정보**: `getCtprvnRltmMesureDnsty`
- **수질정보**: `getRiverQuality`
- **소음정보**: `getNoiseInfo`

### **국토교통부**
- **대중교통정보**: `getSttnNoList`
- **자전거이용정보**: `getBicycleUsage`
- **보행량정보**: `getWalkingData`

### **기상청**
- **단기예보**: `getUltraSrtNcst`
- **중기예보**: `getMidFcst`
- **기상특보**: `getWeatherWarning`

### **통계청**
- **에너지통계**: `getEnergyStatistics`
- **환경통계**: `getEnvironmentalStats`
- **지역통계**: `getRegionalStats`

## **🚨 주의사항**

1. **API 키 보안**: .env 파일을 .gitignore에 추가
2. **호출 제한**: API별 일일 호출 제한 확인
3. **데이터 정확성**: 공식 문서 확인 후 사용
4. **업데이트 주기**: API 스키마 변경 시 대응
5. **에러 처리**: 모든 API 호출에 예외 처리 필수

## **💡 팁**

- **테스트 먼저**: API 키 발급 후 테스트 엔드포인트로 확인
- **점진적 적용**: 하나씩 API를 추가하며 테스트
- **기본값 준비**: API 실패 시 사용할 현실적인 기본값 준비
- **문서화**: 사용하는 API의 문서를 잘 읽고 이해하기



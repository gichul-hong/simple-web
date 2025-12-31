> argocd 를  통 해  application 을  배 포 하 고  관 리 하 고  있 어 . 이  application은  next.js 기 반 으 로  만 들 어 졌 고 , 여 기 서 는  github를  통 해  인 증 하 려 고  해 . 폐쇄 망 인  회 사  내 부 로  가 져 갈  때 는  인 증  방 식 을  keycloak으 로  전 환 할
  예 정 이 야 . application들 은  helm chart 기 반 으 로  배 포 되 고 , application list를  불 러 오 는  부 분 과 , application을  생 성 하 는  기 능 을  담 당 하 는  backend는  이 미  만 들 어 놓 은  상 태 야 . 해 당  backend는  application 목 록 을  조 회 하 는
  api를  호 출 했 을  때 , name, chartRepoUrl, chartName, chartRevision, project, status, externalURL, namespace, applicationSetName, authSync, fileBrowserUrl, creationTimestamp 를  목 록 으 로  받 아 . 신 규  nextjs
  application을  만 들 고 , application 목 록 을  가 져 오 는  api도  구 현 해 줘 . 테 스 트 를  위 해  dummy data가  내 려 가 도 록  해 주 고 , application 목 록 을  보 는  화 면 도  만 들 어 줘 . 최 대 한  UI는  모 던 해 야 해 .

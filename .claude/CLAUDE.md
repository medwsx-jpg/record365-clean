# 프로젝트 지침

## 배포
코드 변경 후 항상 배포 명령어를 안내할 것:
```
cd C:\Projects\record365-app\cleanmatch-web
git add <변경된 파일들>
git commit -m "<커밋 메시지>"
git push
```
- `git add .` 사용 금지 (node_modules 재추가 방지)
- 변경된 파일만 개별 지정

## 파일 편집 주의
- Windows 마운트 파일시스템에서 Edit/Write 도구 사용 시 null byte 손상 발생 가능
- 큰 파일은 bash heredoc으로 작성할 것

## 배포 환경
- GitHub: medwsx-jpg / record365-clean
- Vercel: record365-clean-6q7o (자동 빌드)
- URL: https://record365-clean-6q7o.vercel.app

# server-boilerplate
server-boilerplate


# migration db use sequelize
https://viblo.asia/p/tao-model-migration-seeds-voi-sequelize-1VgZvOXplAw

## 1 Cài đặt sequelize:

```

yarn add sequelize

nếu lỗi:
mở windows powershell
Set-ExecutionPolicy RemoteSigned

sau đó chạy lại: yarn add sequelize

```

## 2 Cài hệ quản trị cở sở dữ liệu:
```
            yarn add mssql
```
## 3 Cài sequelize-cli:
```
            yarn global add sequelize-cli
```
## 4 Tiếp theo chúng ta sẽ tạo Project với lệnh
```
cd migrations-mssql
npx sequelize-cli init

npx sequelize-cli model:generate --name Demo --attributes realName:string,address:string
npx sequelize-cli model:generate --name pol_user --attributes realName:string,address:string
npx sequelize-cli model:generate --name call_detail_records --attributes id:UUID,callId:bigint,called:string,caller:string,connectTime:bigint,destLegId:bigint,direction:string,disconnectTime:bigint,duration:INTEGER,fileStatus:string,origCalledLoginUserId:string,origCallingLoginUserId:string,origLegId:bigint,origTime:bigint,teamId:INTEGER,agentId:INTEGER,recordingFileName:string

Chạy Migration
Chạy migration với lệnh :

                npx sequelize-cli db:migrate

```
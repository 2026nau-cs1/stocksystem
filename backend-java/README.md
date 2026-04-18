# Spring Boot Backend

This folder contains the Java backend that mirrors the TypeScript API surface used by the React frontend.

## Run on Windows

```powershell
cd E:\stockwork\product----main\product----main\backend-java
mvn spring-boot:run
```

## Run with Script Wrapper

```powershell
cd E:\stockwork\product----main\product----main\backend-java
.\run-backend.ps1
```

The script uses the globally installed Maven available on your `Path`.

## Run Full Stack From Root

```powershell
cd E:\stockwork\product----main\product----main
.\run-dev.ps1
```

This starts:

- Spring Boot backend
- React frontend

## Environment

The backend reads the same root `.env` values:

- `DATABASE_URL`
- `DB_SSL`
- `JWT_SECRET`
- `PORT`

## Notes

- The Java backend currently listens on its own application port configured in `application.yml`.
- If terminal output still shows garbled characters in runtime logs, that is usually a console encoding issue rather than a source file encoding problem.

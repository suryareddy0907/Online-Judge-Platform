# Compiler Microservice

A secure, Dockerized Node.js service for compiling and running user code in isolation.

---

## Overview
- Receives code and language from backend
- Compiles and executes code in a sandboxed environment
- Returns output or errors
- Should NOT be exposed to the public internet

---

## Directory Structure
```
online-compiler/
├── codes/           # Temp code files (create manually)
├── outputs/         # Temp output files (create manually)
├── executeC.js
├── executeCpp.js
├── executeJava.js
├── executePython.js
├── generateFile.js
├── index.js         # Express server
├── package.json
```

---

## Setup Instructions
```bash
cd online-compiler
npm install
mkdir codes outputs
```

---

## Docker Usage

### Build the Docker image
```bash
docker build -t online-compiler .
```

### Run the container
```bash
docker run -d -p 5001:5001 --name online-compiler online-compiler
```

---

## Security Notes
- Only expose port 5001 to trusted backend
- Never expose to public internet
- Use AWS security groups/firewall to restrict access

---

## Usage
- Backend should POST to `/run` endpoint on this service
- Set `COMPILER_SERVICE_URL` in backend `.env` to the deployed compiler URL (e.g., `http://oj-compiler.me:5001/run`)

---

## Example .env (Backend)
```env
PORT=<PORT_NUMBER>
COMPILER_SERVICE_URL=<your-compiler-service-url>/run
```
> **Note:** Use placeholders for all URLs and ports. The PORT variable may be ignored in production deployments. 
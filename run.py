import uvicorn

if __name__ == "__main__":
    # Launch ASGI server with hot-reloading active
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )

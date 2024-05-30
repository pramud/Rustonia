use actix_web::{post, web, App, HttpResponse, HttpServer, Responder};
use serde::Deserialize;
use std::process::Command;
use std::io::Write;
use std::fs::{self, File};
use std::path::PathBuf;
use uuid::Uuid;

#[derive(Deserialize)]
struct CodePayload {
    code: String,
}

#[post("/execute")]
async fn execute_code(payload: web::Json<CodePayload>) -> impl Responder {
    let code = &payload.code;
    let temp_dir = PathBuf::from("/tmp").join(Uuid::new_v4().to_string());
    fs::create_dir_all(&temp_dir).unwrap();

    let temp_file_path = temp_dir.join("main.rs");
    let executable_path = temp_dir.join("main");

    // Write code to the temporary file
    let mut temp_file = File::create(&temp_file_path).unwrap();
    write!(temp_file, "{}", code).unwrap();
    temp_file.flush().unwrap();

    // Compile the code with a timeout
    let output = Command::new("timeout")
        .arg("10s") // Adjust the timeout
        .arg("rustc")
        .arg(&temp_file_path)
        .arg("-o")
        .arg(&executable_path)
        .output()
        .expect("Failed to compile code");

    if !output.status.success() {
        fs::remove_dir_all(&temp_dir).unwrap();
        return HttpResponse::BadRequest().body(String::from_utf8_lossy(&output.stderr).to_string());
    }

    // Run the compiled executable with a timeout
    let output = Command::new("timeout")
        .arg("5s") // Adjust the timeout 
        .arg(&executable_path)
        .output()
        .expect("Failed to run code");

    fs::remove_dir_all(&temp_dir).unwrap();

    if !output.status.success() {
        return HttpResponse::BadRequest().body(String::from_utf8_lossy(&output.stderr).to_string());
    }

    HttpResponse::Ok().body(String::from_utf8_lossy(&output.stdout).to_string())
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .service(execute_code)
    })
    .bind("0.0.0.0:8080")?
    .run()
    .await
}
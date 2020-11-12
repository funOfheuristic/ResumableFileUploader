import { Component, OnInit } from "@angular/core";
import {
  HttpClient,
  HttpHeaders,
  HttpRequest,
  HttpEventType,
} from "@angular/common/http";

declare const socket: any;
// const socket = io("http://localhost:3000");

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent implements OnInit {
  title = "resumeUpload-ui";
  selectedFile;
  fReader;
  name = "";
  uploadPercent;

  color = "primary";
  mode = "determinate";
  value = 50.25890809809;
  socket = "http";
  constructor(private http: HttpClient) {}

  ngOnInit() {}

  goToLink(url: string) {
    window.open(url, "_blank");
  }

  onFileSelect(event) {
    this.selectedFile = event.target.files[0];
    this.name = this.selectedFile.name;
    console.log(this.selectedFile);
  }

  resumableUpload() {
    let fileId = `${this.selectedFile.name}-${this.selectedFile.lastModified}`;
    let headers = new HttpHeaders({
      size: this.selectedFile.size.toString(),
      "x-file-id": fileId,
      name: this.name,
    });

    this.http
      .get("http://localhost:3000/status", { headers: headers })
      .subscribe((res: any) => {
        console.log(JSON.stringify(res));
        if (res.status === "file is present") {
          alert(res.status);
          return;
        }
        let uploadedBytes = res.uploaded;
        console.log(uploadedBytes);
        let headers2 = new HttpHeaders({
          size: this.selectedFile.size.toString(),
          "x-file-id": fileId,
          "x-start-byte": uploadedBytes.toString(),
          name: this.name,
        });
        const req = new HttpRequest(
          "POST",
          "http://localhost:3000/upload",
          this.selectedFile.slice(uploadedBytes, this.selectedFile.size + 1),
          {
            headers: headers2,
            reportProgress: true,
          }
        );
        this.http.request(req).subscribe(
          (res: any) => {
            if (res.type === HttpEventType.UploadProgress) {
              this.uploadPercent = Math.round(
                100 * ((res.loaded + uploadedBytes) / this.selectedFile.size)
              );
              if (this.uploadPercent >= 100) {
                this.name = "";
                this.selectedFile = null;
              }
            } else {
              console.log(JSON.stringify(res));
              if (this.uploadPercent >= 100) {
                this.name = "";
                this.selectedFile = null;
              }
            }
          },
          (err) => {}
        );
      });
  }
}

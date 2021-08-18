package main

import (
	"net/http"
	"log"
	"fmt"
	"flag"
	"fractalHeaven/render"
	"image/jpeg"
	"os"
)

const (
	WIDTH, HEIGHT = 1024, 1024
	PORT = "8080"
)

var t bool
func init() {
	flag.BoolVar(&t, "t", false, "Run test stub.")
}

func main() {
	flag.Parse()
	if t {
		testStub()
		return
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/api/", helloWorld)

	server := &http.Server{
		Addr: fmt.Sprintf("127.0.0.1:%s", PORT),
		Handler: mux,
	}

	log.Printf("Server started on port %s.\n", PORT)
	server.ListenAndServe()
}

func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
}

func helloWorld(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(200)
	w.Write([]byte("hello world!"))
	return
}

func testStub() {
	frameInfo := render.ConstructFrameInfo(float64(2.0), float64(-2.0), float64(-2.0), float64(2.0), float64(2.0), float64(0.0), float64(0.0))
	img := <-render.RenderMFrame(WIDTH, HEIGHT, frameInfo)
	log.Println("Image rendered.")
	jpeg.Encode(os.Stdout, img, nil)

}

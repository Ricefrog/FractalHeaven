package main

import (
	"net/http"
	"log"
	"fmt"
	"flag"
	"fractalHeaven/render"
	"image/jpeg"
	"os"
	"encoding/json"
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
	mux.HandleFunc("/api/renderFractal", renderFractal)

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

type resStruct struct {
	X float64
	Y float64
	Zoom float64
	FractalType string
}

func renderFractal(w http.ResponseWriter, r *http.Request) {
	log.Println("renderFractal received response.")
	log.Println(r)
	decoder := json.NewDecoder(r.Body)
	var s resStruct
	err := decoder.Decode(&s)
	if err != nil {
		w.WriteHeader(500)
		log.Print(err)
		return
	}
	responseString := fmt.Sprintf("%+v", s)
	enableCors(&w)
	w.Write([]byte(responseString))
}

func testStub() {
	frameInfo := render.ConstructFrameInfo(float64(2.0), float64(-2.0), float64(-2.0), float64(2.0), float64(2.0), float64(0.0), float64(0.0))
	img := <-render.RenderMFrame(WIDTH, HEIGHT, frameInfo)
	log.Println("Image rendered.")
	jpeg.Encode(os.Stdout, img, nil)

}

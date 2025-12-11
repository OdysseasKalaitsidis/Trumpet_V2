# Trumpet (Dev Setup)

Simple setup guide for the **Corfiot Music Paths** archive. This project uses Python to fetch files and .NET/SQLite to serve them locally.

## 🛠 Prerequisites
* **Python 3** (for downloading files)
* **[ .NET 8.0 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)** (for the app & database)
* **Git**

---

## 🚀 How to Run

### 1. Clone & Setup
Clone the repo and enter the folder:
```bash
git clone [https://github.com/giannisgks/trumpet.git](https://github.com/giannisgks/trumpet.git)
cd trumpet
```
2. Download the Media (Python)
The repo does not include the heavy PDFs/Audio. You must download them to your local out/ folder first.


```bash
pip install requests
python items_final.py
```
(This takes a while. It will create a local out/ folder with ~1GB of data.)

3. Build the Database (C#)
We use a local SQLite database (corfiot_music.db). It is not shared on Git; you must generate your own based on the files you just downloaded.

```bash
cd Trumpet_Net
dotnet run
```
Wait until you see "Done!" and "Imported X items".

4. Run the Website (C#)
Once the database is ready, start the web server to browse the collection.

```bash
cd ../Trumpet_Web
dotnet run
```
Click the http://localhost:xxxx link in your terminal to open the app.

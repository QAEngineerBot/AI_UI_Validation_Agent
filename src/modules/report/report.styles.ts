export class ReportStyles {
  render(): string {
    return `
<style>

*{
    margin:0;
    padding:0;
    box-sizing:border-box;
}

body{
    font-family:Segoe UI,Arial,sans-serif;
    background:#f4f6f9;
    color:#333;
    padding:40px;
}

.container{
    max-width:1600px;
    margin:auto;
}

.header{
    background:#1976d2;
    color:white;
    padding:30px;
    border-radius:10px;
    margin-bottom:25px;
}

.header h1{
    font-size:34px;
    margin-bottom:10px;
}

.header p{
    opacity:.9;
    font-size:15px;
}

.summary{
    display:grid;
    grid-template-columns:repeat(4,1fr);
    gap:20px;
    margin-bottom:30px;
}

.card{
    background:white;
    border-radius:10px;
    padding:25px;
    text-align:center;
    box-shadow:0 4px 12px rgba(0,0,0,.08);
}

.card h2{
    font-size:38px;
    margin-bottom:10px;
}

.card p{
    color:#666;
}

.pass{
    color:#2e7d32;
}

.fail{
    color:#c62828;
}

.rate{
    color:#1565c0;
}

.screen{
    background:white;
    border-radius:10px;
    padding:25px;
    margin-bottom:25px;
    box-shadow:0 2px 8px rgba(0,0,0,.08);
}
    .image-container{
    display:flex;
    justify-content:center;
    align-items:flex-start;
    gap:60px;
    margin:35px 0;
    flex-wrap:wrap;
}

.image-card{

    width:300px;

    text-align:center;
}

.image-card h3{

    margin-bottom:18px;

    font-size:18px;

    color:#444;
}

.phone-frame{

    background:#111;

    border-radius:35px;

    padding:12px;

    box-shadow:
        0 12px 30px rgba(0,0,0,.35);

    transition:.25s;

}

.phone-frame:hover{

    transform:translateY(-4px);

    box-shadow:
        0 18px 40px rgba(0,0,0,.45);

}

.phone-notch{

    width:110px;

    height:18px;

    background:#222;

    border-radius:0 0 14px 14px;

    margin:0 auto 10px;
}

.phone-frame img{

    width:100%;

    border-radius:24px;

    display:block;

    cursor:pointer;
}

.summary-box{
    margin-top:20px;
    padding:15px;
    background:#f8f8f8;
    border-left:4px solid #1976d2;
    border-radius:6px;
}

</style>
`;
  }
}
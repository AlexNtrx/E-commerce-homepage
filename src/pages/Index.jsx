import Swal from "sweetalert2";
import axios from "axios";
import config from "../config";
import { useEffect, useState } from "react";
import MyModal from "../components/Mymodal";
import dayjs from "dayjs";

function Index() {
  const [products, setProducts] = useState([]);
  const [carts,setCarts] = useState([]);
  const [recordInCarts, setRecordIncarts] = useState(0);
  const [sumQty,setSumQty] = useState(0);
  const [sumPrice, setSumPrice] = useState(0);
  const [customerName , setCustomerName] = useState('');
  const [customerPhone , setCustomerPhone] = useState('');
  const [customerAddress , setCustomerAddress] = useState('');
  const [payDate , setPayDate] = useState(dayjs(new Date()).format('YYYY-MM-DD'));
  const [payTime , setPayTime] = useState('');

  
 

  useEffect(() => {
    fetchData();
    fetchDataFromLocal();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(config.apiPath + "/product/list");
      if (res.data.results !== undefined) {
        setProducts(res.data.results);
      }
    } catch (e) {
      Swal.fire({
        title: "error",
        text: e.message,
        icon: "error",
      });
    }
  };
  function showImage(item) {
    if(item.img !== undefined){
    let imgPath = config.apiPath + '/uploads/' + item.img;
    if (item.img == "") imgPath ="default_image.jpg";
    
      return <img className="card-img-top"
          height="150px" src={imgPath}
          alt=""
        />
      }
      
   return <></>;
  }
  const addToCart = (item) =>{
    let arr =carts;
    if(arr === null){
      arr = [];
    }
    arr.push(item);

    setCarts(arr);
    setRecordIncarts(arr.length);

    localStorage.setItem('carts', JSON.stringify(carts));
  }
  const fetchDataFromLocal = () =>{
    const itemInCarts = JSON.parse(localStorage.getItem('carts'));

    if(itemInCarts !== null){
    setCarts(itemInCarts);
    setRecordIncarts(itemInCarts !== null ? itemInCarts.length :0);

    computePriceAndQty(itemInCarts);
    }
  }
  const computePriceAndQty =(itemInCarts) =>{
    let sumQty = 0;
    let sumPrice =0;
    for (let i = 0; i < itemInCarts.length; i++){
      const item = itemInCarts[i];
      sumQty++;
      sumPrice += parseInt(item.price);
      
    }
  
    setSumPrice(sumPrice);
    setSumQty(sumQty);
  }

    const handleRemove = async (item) =>{
      try{
        const button = await Swal.fire({
          title:'ลบสินค้า',
          text:'คุณต้องการลบสินค้าออกจากตะกร้าใช่หรือไม่',
          icon:'question',
          showCancelButton:true,
          showConfirmButton:true
        }) 

        if(button.isConfirmed){
          let arr = carts;

          for(let i =0; i < arr.length; i++){
            const itemInCart = arr[i];
            
            if(item.id === itemInCart.id){
              arr.splice(i,1);
            }
          }
          setCarts(arr);
          setRecordIncarts(arr.length);

          localStorage.setItem('carts', JSON.stringify(arr))
        }
      }catch(e){
        Swal.fire({
          title:'error',
          text: e.message,
          icon:'error'
        })
      }
    }

    const handleSave = async () => {
      try{
        const payload = {
          customerName:customerName,
          customerPhone:customerPhone,
          customerAddress:customerAddress,
          payDate:payDate,
          payTime:payTime,
          carts:carts
        }
        const res = await axios.post(config.apiPath + '/api/sale/save', payload);
        if(res.data.message ==='success'){
          localStorage.removeItem('carts');
          setRecordIncarts(0);
          setCarts([]);

          Swal.fire({
            title:'บันทึกข้อมูล',
            text: 'ระบบได้บันทึกข้อมูลคุณแล้ว',
            icon:'success'
          })
          document.getElementById('modalCart_btnClose').click();
          setCustomerName('');
          setCustomerPhone('');
          setCustomerAddress('');
          setPayDate(new Date());
          setPayTime('');

        }

      }catch(e){
        Swal.fire({
          title:'error',
          text: e.message,
          icon:'error'
        })
      }
    }
  

  return (
    <>
      <div className="container mt-3">
        <div className="float-start">
        <div className="h3">สินค้าของเรา</div>
        </div>
        <div className="float-end">
        ตะกร้าของฉัน
        <button 
        data-bs-toggle ="modal"
        data-bs-target ="#modalCart"
        className="btn btn-outline-success ms-2 me-2">
          <i className="fa fa-shopping-cart me-2"></i>
          {recordInCarts}
        </button>
        ชิ้น
        </div>
        <div className="clearfix"></div>
        <div className="row">
          {products.length > 0 ? (
            products.map((item) => (
              <div className="col-3 mt-3" key={item.id}>
                <div className="card">
                  {showImage(item)}
                  <div className="card-body">
                    <div>{item.name}</div>
                    <div>{item.price.toLocaleString('th-TH')}</div>
                    <div className="text-center">
                      <button className="btn btn-primary" onClick={e => addToCart(item)}>
                        <i className="fa fa-shopping-cart me-2"></i>
                        Add to cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <></>
          )}
        </div>
      </div>
    <MyModal id="modalCart" title="ตะกร้าสินค้า">
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>name</th>
              <th className="text-end">price</th>
              <th className="text-end">qty</th>
              <th width="60px"></th>
            </tr>
          </thead>
        
        <tbody>
          {carts.length > 0 ? carts.map(item =>
            <tr key={item.id}>
              <td>{item.name}</td>
              <td className="text-end">{item.price.toLocaleString('th-TH')}</td>
              <td className="text-end">1</td>
              <td className="text-center">
                <button className="btn btn-danger" onClick={e => handleRemove(item)}>
                  <i className="fa fa-times"></i>
                </button>
              </td>
            </tr>
          ): <></>}
        </tbody>
        </table>
        <div className="mt-3">
          <div className="alert alert-info">
          <div>บัญชี นิติธร</div>
          <div>พร้อมเพย์ 0645462825</div>
        </div>
        </div>

        <div className="text-center">
          จำนวน {sumQty} รายการ เป็นเงิน {sumPrice} บาท
        </div>
        <div className="mt-3">
          <div>ชื่อผู้ซื่อ</div>
          <input className="form-control" onChange={e => setCustomerName(e.target.value)}/>
        </div>
        <div>
          <div>เบอร์โทรศัพท์</div>
          <input className="form-control" onChange={e => setCustomerPhone(e.target.value)}/>
        </div>
        <div>
          <div>ที่อยู่จัดส่ง</div>
          <input className="form-control"onChange={e => setCustomerAddress(e.target.value)} />
        </div>
        <div>
          <div>วันที่โอน</div>
          <input className="form-control" value={payDate} onChange={e => setPayDate(e.target.value)} />
        </div>
        <div>
          <div>เวลาที่โอนเงิน</div>
          <input className="form-control" onChange={e => setPayTime(e.target.value)}/>
        </div>
        <button className="btn btn-primary mt-3" onClick={handleSave}>
          <i className="fa fa-check me-2"></i>ยืนยันการซื้อ
        </button>
       
      </MyModal>
    </>
  );
}
export default Index;

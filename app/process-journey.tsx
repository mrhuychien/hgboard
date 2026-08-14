"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const Factory3D = dynamic(() => import("./factory-3d"), {
  ssr: false,
  loading: () => <div className="factory3d-loading"><span />Đang dựng xưởng 3D</div>,
});

const stages = [
  {
    id: "boil",
    number: "01",
    eyebrow: "KHỞI ĐỘNG DÒNG ĐỖ",
    title: "Luộc chín\ntrong 20 phút",
    text: "Đỗ từ kho được chuyển tới nồi luộc. Mỗi mẻ 100 kg được gia nhiệt tới 100°C — bước mở đầu để hạt đạt độ chín đồng đều.",
    image: "/factory/boiler.jpg",
    alt: "Nồi luộc đỗ tại xưởng Hoàng Giang",
    metrics: ["1 nồi luộc", "100 kg / mẻ", "100°C"],
    accent: "#e97a40",
  },
  {
    id: "roast",
    number: "02",
    eyebrow: "TẠO HƯƠNG",
    title: "Rang liên tục\nđến vàng hoa cau",
    text: "Ba máy rang vận hành theo dòng chảy. Hạt đi qua chu trình 3–5 phút, trong vùng nhiệt 255–270°C và được kiểm soát bằng màu sắc thành phẩm.",
    image: "/factory/roaster.jpg",
    alt: "Máy rang đỗ theo dòng chảy",
    metrics: ["3 máy rang", "120 kg / giờ / máy", "255–270°C"],
    accent: "#f3bd44",
  },
  {
    id: "cool",
    number: "03",
    eyebrow: "HÀNH LANG Ủ NGUỘI",
    title: "Ủ kín\ntrong 24 giờ",
    text: "Đỗ rang được chuyển ra hành lang, cho vào thùng gỗ và phủ kín bằng khăn vải. Hạt tiếp tục chín đều trong khi nhiệt độ hạ dần.",
    image: "/factory/wooden-bin.jpg",
    alt: "Thùng gỗ dùng để ủ nguội đỗ",
    metrics: ["Thùng gỗ", "Phủ kín khăn vải", "Khoảng 24 giờ"],
    accent: "#a87952",
  },
  {
    id: "split",
    number: "04",
    eyebrow: "LÀM SẠCH HẠT",
    title: "Vỡ đỗ, tách vỏ\nvà loại tạp chất",
    text: "Một hệ thống liên hoàn thực hiện chà vỏ, sàng, hút bụi và nam châm tách kim loại. Cám và vỏ được đóng bao, chuyển riêng bằng xe đẩy.",
    image: "/factory/process-machines.jpg",
    alt: "Các thiết bị chà vỏ và sàng đỗ",
    metrics: ["1 dây chuyền", "2 tấn / 7 giờ", "Sàng · hút bụi · nam châm"],
    accent: "#d7573d",
  },
  {
    id: "grind",
    number: "05",
    eyebrow: "CHUYỂN HẠT THÀNH BỘT",
    title: "Nghiền mịn\nkhông quá 0,2 mm",
    text: "Đỗ sạch vỏ được đưa vào hai máy nghiền. Bột thành phẩm được kiểm tra độ mịn, sau đó chứa trong thùng để chuyển tới phòng phối trộn.",
    image: "/factory/grinder.jpg",
    alt: "Hệ thống máy nghiền bột đậu xanh",
    metrics: ["2 máy nghiền", "3 tấn / 10 giờ / máy", "≤ 0,2 mm"],
    accent: "#2d8171",
  },
  {
    id: "sugar",
    number: "06",
    eyebrow: "DÒNG ĐƯỜNG HOÁN",
    title: "Nấu cô đặc\nvà đánh bông",
    text: "Ở nhánh nguyên liệu thứ hai, đường được nấu cùng nước và vani tới khi cạn nước, rồi đánh bông để hơi ẩm tiếp tục thoát ra.",
    image: "/factory/mixer.jpg",
    alt: "Thiết bị xử lý đường hoán và nguyên liệu",
    metrics: ["1 nồi", "50 kg / mẻ", "1 giờ / mẻ"],
    accent: "#e8a32f",
  },
  {
    id: "mix",
    number: "07",
    eyebrow: "ĐIỂM HỘI TỤ",
    title: "Hai dòng nguyên liệu\ngặp nhau",
    text: "Bột đỗ và đường hoán được nạp thủ công vào máy phối trộn theo định mức. Mỗi mẻ tạo ra 114 kg hỗn hợp đồng nhất.",
    image: "/factory/process-machines.jpg",
    alt: "Máy phối trộn và máy cán bột",
    metrics: ["1 máy phối trộn", "114 kg / mẻ", "25 mẻ / 8 giờ"],
    accent: "#83a846",
  },
  {
    id: "roll",
    number: "08",
    eyebrow: "Ủ · CÁN TƠI",
    title: "Cho bột nghỉ,\nrồi cán tơi xốp",
    text: "Bột được ủ kín 24 giờ trong thùng inox. Từng mẻ 114 kg được cán trong 15 phút trước khi chuyển đi bằng thùng inox có bánh xe.",
    image: "/factory/inox-bin.jpg",
    alt: "Thùng inox chứa bột trong quy trình sản xuất",
    metrics: ["Ủ 24 giờ", "114 kg / mẻ cán", "15 phút / mẻ"],
    accent: "#6e938a",
  },
];

export default function ProcessJourney() {
  const [active, setActive] = useState(0);
  const cards = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(Number((visible.target as HTMLElement).dataset.index));
      },
      { rootMargin: "-34% 0px -42%", threshold: [0, 0.2, 0.5, 0.8] },
    );
    cards.current.forEach((card) => card && observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="journey-section" aria-label="Các công đoạn sản xuất">
      <div className="journey-head">
        <div className="section-kicker">02 — ĐI THEO DÒNG NGUYÊN LIỆU</div>
        <h2>Mỗi lần cuộn.<br /><em>Một lần chuyển hóa.</em></h2>
      </div>

      <div className="journey-layout">
        <div className="journey-stage">
          <div className="stage-photo stage-3d">
            <Factory3D mode="journey" focus={active} />
            <div className="stage-shade stage-shade-3d" />
            <span className="stage-index">{stages[active].number} / {stages.length.toString().padStart(2, "0")}</span>
            <span className="stage-caption">CAMERA 3D ĐANG THEO DÒNG NGUYÊN LIỆU</span>
            <div className="stage-signal" style={{ background: stages[active].accent }} />
          </div>
          <div className="journey-progress" aria-hidden="true">
            {stages.map((stage, index) => (
              <span key={stage.id} className={index <= active ? "complete" : ""} />
            ))}
          </div>
        </div>

        <div className="journey-copy">
          {stages.map((stage, index) => (
            <article
              id={stage.id}
              key={stage.id}
              data-index={index}
              ref={(node) => { cards.current[index] = node; }}
              className={`stage-card ${index === active ? "active" : ""}`}
            >
              <div className="stage-card-top">
                <span>{stage.number}</span>
                <small>{stage.eyebrow}</small>
              </div>
              <h3>{stage.title.split("\n").map((line) => <span key={line}>{line}</span>)}</h3>
              <p>{stage.text}</p>
              <div className="reality-card">
                <Image src={stage.image} alt={stage.alt} width={150} height={92} unoptimized />
                <span><small>ĐỐI CHIẾU</small>Thiết bị thực tế</span>
              </div>
              <div className="metric-pills">
                {stage.metrics.map((metric) => <span key={metric}>{metric}</span>)}
              </div>
            </article>
          ))}
        </div>
      </div>

      <section className="pack-finale" id="pack">
        <div className="pack-copy">
          <p className="eyebrow"><span /> CÔNG ĐOẠN HOÀN THIỆN</p>
          <h2>50 viên mỗi phút.<br /><em>Trên mỗi máy.</em></h2>
          <p>
            Bột được nạp thủ công vào 20 máy tạo viên và đóng gói tự động.
            Công nhân kiểm tra hình dạng, khối lượng và độ kín trước khi bánh
            được vào hộp và chuyển tới kho thành phẩm.
          </p>
          <div className="final-metrics">
            <div><strong>20</strong><span>máy tạo viên<br />và đóng gói</span></div>
            <div><strong>50</strong><span>viên / phút<br />trên mỗi máy</span></div>
            <div><strong>3</strong><span>khối lượng viên<br />khác nhau</span></div>
          </div>
        </div>
        <div className="cake-machine" aria-label="Mô hình 3D máy đóng gói tạo ra các viên bánh">
          <Factory3D mode="journey" focus={8} />
          <div className="finish-badge"><span>✓</span><strong>HOÀN THIỆN</strong><small>Chuyển vào kho thành phẩm</small></div>
        </div>
      </section>
    </section>
  );
}

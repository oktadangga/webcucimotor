document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    lucide.createIcons();

    // Mobile Menu Logic
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.setAttribute('data-lucide', 'x');
            } else {
                icon.setAttribute('data-lucide', 'menu');
            }
            lucide.createIcons();
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                icon.setAttribute('data-lucide', 'menu');
                lucide.createIcons();
            });
        });
    }

    // Reveal animations on scroll
    const reveals = document.querySelectorAll('.reveal');

    const revealOnScroll = () => {
        reveals.forEach(reveal => {
            const windowHeight = window.innerHeight;
            const revealTop = reveal.getBoundingClientRect().top;
            const revealPoint = 100;

            if (revealTop < windowHeight - revealPoint) {
                reveal.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Initial check

    // Navbar style change on scroll
    const nav = document.querySelector('nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.style.padding = '1rem 0';
            nav.style.background = 'rgba(10, 10, 10, 0.95)';
        } else {
            nav.style.padding = '1.5rem 0';
            nav.style.background = 'rgba(10, 10, 10, 0.8)';
        }
    });

    // Form submission handler to WhatsApp
    const form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('booking-name').value.trim();
            const motor = document.getElementById('booking-motor').value.trim();
            const wa = document.getElementById('booking-wa').value.trim();
            const packageChoice = document.getElementById('booking-package').value;
            const message = document.getElementById('booking-message').value.trim();

            const btn = form.querySelector('button');
            btn.innerText = 'Menyimpan data...';
            btn.disabled = true;

            const payload = {
                name,
                motor,
                wa,
                packageChoice,
                message
            };

            try {
                const response = await fetch('/api/bookings', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    const result = await response.json();
                    throw new Error(result.error || 'Gagal menyimpan booking');
                }

                const text = `Halo J'Wash,%0A%0ASaya mau booking cuci motor:%0A- *Nama:* ${name}%0A- *Motor:* ${motor}%0A- *Paket:* ${packageChoice}%0A- *WA:* ${wa}%0A- *Pesan:* ${message}`;

                form.innerHTML = `
                    <div style="text-align: center; padding: 3rem; background: rgba(34, 197, 94, 0.1); border-radius: 1rem; border: 1px solid #22c55e;">
                        <i data-lucide="check-circle" style="width: 64px; height: 64px; color: #22c55e; margin-bottom: 1rem;"></i>
                        <h2 style="color: white; margin-bottom: 0.5rem;">Pemesanan Berhasil!</h2>
                        <p style="color: #888; margin-bottom: 1.5rem;">Booking Anda telah tersimpan di server. Silakan lanjutkan ke WhatsApp untuk konfirmasi.</p>
                        <a href="https://api.whatsapp.com/send?phone=6281225306074&text=${text}" target="_blank" class="btn btn-primary">Klik Jika WA Tidak Terbuka</a>
                    </div>
                `;
                lucide.createIcons();
                window.location.href = `https://api.whatsapp.com/send?phone=6281225306074&text=${text}`;
            } catch (error) {
                alert(`Terjadi kesalahan: ${error.message}`);
                btn.innerText = 'Konfirmasi via WhatsApp';
                btn.disabled = false;
            }
        });
    }
});

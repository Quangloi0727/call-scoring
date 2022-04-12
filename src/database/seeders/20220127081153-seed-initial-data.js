'use strict';

const users = [
  { id: 1, firstName: 'admin', lastName: 'admin', userName: 'admin', fullName: 'admin', extension: 0 },
  // { id: 2, fullName: 'Nguyen Thi Chau', firstName: 'Nguyen Thi', lastName: 'Chau', userName: 'chaunt.ho', extension: 2025 },
  // { id: 3, fullName: 'Pham Thi Huyen', firstName: 'Pham Thi', lastName: 'Huyen', userName: 'huyenpt.ho', extension: 2115 },
  // { id: 4, fullName: 'Dinh Thi Loan', firstName: 'Dinh Thi', lastName: 'Loan', userName: 'loandt.ho', extension: 2862 },
  // { id: 5, fullName: 'Le Minh Tam', firstName: 'Le Minh', lastName: 'Tam', userName: 'tamlm1.ho', extension: 2039 },
  // { id: 6, fullName: 'Nguyen Thi Van Anh', firstName: 'Nguyen Thi Van', lastName: 'Anh', userName: 'anhntv.ho', extension: 2011 },
  // { id: 7, fullName: 'Nguyen Van Long', firstName: 'Nguyen Van', lastName: 'Long', userName: 'longnv.ho', extension: 2882 },
  // { id: 8, fullName: 'Ly Danh Phuc', firstName: 'Ly Danh', lastName: 'Phuc', userName: 'phucld.ho', extension: 2237 },
  // { id: 9, fullName: 'Thai Dinh Quyet', firstName: 'Thai Dinh', lastName: 'Quyet', userName: 'quyettd.ho', extension: 2251 },
  // { id: 10, fullName: 'Nguyen Kieu Oanh', firstName: 'Nguyen Kieu', lastName: 'Oanh', userName: 'oanhnk.ho', extension: 2139 },

  // { id: 11, fullName: 'Do Van Duong', firstName: 'Do Van', lastName: 'Duong', userName: 'duongdv.ho', extension: 2052 },
  // { id: 12, fullName: 'Nguyen Thi Yen Nhi', firstName: 'Nguyen Thi Yen', lastName: 'Nhi', userName: 'nhinty.ho', extension: 2265 },
  // { id: 13, fullName: 'Hoang Thi Thu', firstName: 'Hoang Thi', lastName: 'Thu', userName: 'thuht1.ho', extension: 2004 },
  // { id: 14, fullName: 'Le Quang Tien', firstName: 'Le Quang', lastName: 'Tien', userName: 'tienlq.ho', extension: 2901 },
  // { id: 15, fullName: 'Bui Quang Huy', firstName: 'Bui Quang', lastName: 'Huy', userName: 'huybq.ho', extension: 2110 },
  // { id: 16, fullName: 'Cao Thi Phuong', firstName: 'Cao Thi', lastName: 'Phuong', userName: 'phuongct.ho', extension: 2879 },
  // { id: 17, fullName: 'Nguyen Trong Tung', firstName: 'Nguyen Trong', lastName: 'Tung', userName: 'tungnt.ho', extension: 2355 },
  // { id: 18, fullName: 'Vu Kim Bao', firstName: 'Vu Kim', lastName: 'Bao', userName: 'baovk.ho', extension: 2017 },
  // { id: 19, fullName: 'Doan Thi My Hanh', firstName: 'Doan Thi My', lastName: 'Hanh', userName: 'hanhdtm1.ho', extension: 2073 },
  // { id: 20, fullName: 'Nguyen Hoang Hiep', firstName: 'Nguyen Hoang', lastName: 'Hiep', userName: 'hiepnh.ho', extension: 2085 },
  // { id: 21, fullName: 'Do Thu Trang', firstName: 'Do Thu', lastName: 'Trang', userName: 'trangdt1.ho', extension: 2329 },
  // { id: 22, fullName: 'Nguyen Hong Nhung 1', firstName: 'Nguyen Hong', lastName: 'Nhung 1', userName: 'nhungnh1.ho', extension: 2872 },
  // { id: 23, fullName: 'Pham Ha Chau', firstName: 'Pham Ha', lastName: 'Chau', userName: 'chauph.ho', extension: 2926 },
  // { id: 24, fullName: 'Hoang Bich Diep', firstName: 'Hoang Bich', lastName: 'Diep', userName: 'diephb.ho', extension: 2887 },
  // { id: 25, fullName: 'Nong Thi Truc Hang', firstName: 'Nong Thi Truc', lastName: 'Hang', userName: 'hangntt1.ho', extension: 2067 },
  // { id: 26, fullName: 'Le Thi Sang', firstName: 'Le Thi', lastName: 'Sang', userName: 'sanglt.ho', extension: 2855 },
  // { id: 27, fullName: 'Bui Thi Bich Trinh', firstName: 'Bui Thi Bich', lastName: 'Trinh', userName: 'trinhbtb.ho', extension: 2857 },
  // { id: 28, fullName: 'Nguyen Dieu Huong', firstName: 'Nguyen Dieu', lastName: 'Huong', userName: 'huongnd.ho', extension: 2859 },
  // { id: 29, fullName: 'Trinh Thi Dung', firstName: 'Trinh Thi', lastName: 'Dung', userName: 'dungtt1.ho', extension: 2885 },
  // { id: 30, fullName: 'Tran Thi Huyen', firstName: 'Tran Thi', lastName: 'Huyen', userName: 'huyentt1.ho', extension: 2900 },
  // { id: 31, fullName: 'Hoang Thi Hoan', firstName: 'Hoang Thi', lastName: 'Hoan', userName: 'hoanht.ho', extension: 2870 },
  // { id: 32, fullName: 'Dang Thuy Anh', firstName: 'Dang Thuy', lastName: 'Anh', userName: 'anhdt.ho', extension: 2871 },
  // { id: 33, fullName: 'Trinh Thi Tuoi', firstName: 'Trinh Thi', lastName: 'Tuoi', userName: 'tuoitt1.ho', extension: 2777 },
  // { id: 34, fullName: 'Nguyen Thi Huyen', firstName: 'Nguyen Thi', lastName: 'Huyen', userName: 'huyennt15.ho', extension: 2864 },
  // { id: 35, fullName: 'Nguyen Hoai Luong', firstName: 'Nguyen Hoai', lastName: 'Luong', userName: 'luongnh.ho', extension: 2884 },
  // { id: 36, fullName: 'Vu Thi Huyen', firstName: 'Vu Thi', lastName: 'Huyen', userName: 'huyenvt1.ho', extension: 2780 },
  // { id: 37, fullName: 'Dinh Thi Khanh Ly', firstName: 'Dinh Thi Khanh', lastName: 'Ly', userName: 'lydtk.ho', extension: 2390 },
  // { id: 38, fullName: 'Dam Tung Lam', firstName: 'Dam Tung', lastName: 'Lam', userName: 'lamdt.ho', extension: 2059 },
  // { id: 39, fullName: 'Nong Thi Thuy Linh', firstName: 'Nong Thi Thuy', lastName: 'Linh', userName: 'linhntt1.ho', extension: 2886 },
  // { id: 40, fullName: 'Pham Thi Bich Hong', firstName: 'Pham Thi Bich', lastName: 'Hong', userName: 'hongptb.ho', extension: 2865 },
  // { id: 41, fullName: 'Nguyen Thuy Ngan', firstName: 'Nguyen Thuy', lastName: 'Ngan', userName: 'ngannt1.ho', extension: 2841 },
  // { id: 42, fullName: 'Nguyen Thi Minh Trang', firstName: 'Nguyen Thi Minh', lastName: 'Trang', userName: 'trangntm3.ho', extension: 3899 },
  // { id: 43, fullName: 'Dinh Hong Ngoc', firstName: 'Dinh Hong', lastName: 'Ngoc', userName: 'ngocdh2.ho', extension: 2881 },
  // { id: 44, fullName: 'Nguyen Thi Quyen', firstName: 'Nguyen Thi', lastName: 'Quyen', userName: 'quyennt1.ho', extension: 2751 },
  // { id: 45, fullName: 'Nguyen Hong Nhung 3', firstName: 'Nguyen Hong', lastName: 'Nhung 3', userName: 'nhungnh3.ho', extension: 2866 },
  // { id: 46, fullName: 'Phung Ngoc Hoang', firstName: 'Phung Ngoc', lastName: 'Hoang', userName: 'hoangpn.ho', extension: 2924 },
  // { id: 47, fullName: 'Dong Viet Anh', firstName: 'Dong Viet', lastName: 'Anh', userName: 'anhdv2.ho', extension: 2927 },
  // { id: 48, fullName: 'Tran Duc Trung', firstName: 'Tran Duc', lastName: 'Trung', userName: 'trungtd.ho', extension: 2081 },
  // { id: 49, fullName: 'Pham Khanh Linh', firstName: 'Pham Khanh', lastName: 'Linh', userName: 'linhpk.ho', extension: 2098 },
  // { id: 50, fullName: 'Ngo Thanh Cham', firstName: 'Ngo Thanh', lastName: 'Cham', userName: 'chamnt1.ho', extension: 2895 },
  // { id: 51, fullName: 'Nguyen Thi Minh Huyen', firstName: 'Nguyen Thi Minh', lastName: 'Huyen', userName: 'huyenntm.ho', extension: 2873 },
  // { id: 52, fullName: 'Phan Huy Hoang', firstName: 'Phan Huy', lastName: 'Hoang', userName: 'hoangph.ho', extension: 2883 },
  // { id: 53, fullName: 'Pham Thi Huong', firstName: 'Pham Thi', lastName: 'Huong', userName: 'huongpt3.ho', extension: 2054 },
  // { id: 54, fullName: 'Bui Thi Thu Hang', firstName: 'Bui Thi Thu', lastName: 'Hang', userName: 'hangbtt.ho', extension: 2082 },
  // { id: 55, fullName: 'Chu Thi Anh', firstName: 'Chu Thi', lastName: 'Anh', userName: 'anhct.ho', extension: 2099 },
  // { id: 56, fullName: 'Quan Thi Nghiep', firstName: 'Quan Thi', lastName: 'Nghiep', userName: 'nghiepqt.ho', extension: 2150 },
  // { id: 57, fullName: 'Vu Thuy Duong', firstName: 'Vu Thuy', lastName: 'Duong', userName: 'duongvt2.ho', extension: 2778 },
  // { id: 58, fullName: 'Nguyen Thi Hue', firstName: 'Nguyen Thi', lastName: 'Hue', userName: 'huent.ho', extension: 2096 },
  // { id: 59, fullName: 'Nguyen Thi Nha', firstName: 'Nguyen Thi', lastName: 'Nha', userName: 'nhant.ho', extension: 2932 },
  // { id: 60, fullName: 'Nguyen Minh Phuong', firstName: 'Nguyen Minh', lastName: 'Phuong', userName: 'phuongnm2.ho', extension: 2769 },
  // { id: 61, fullName: 'Nguyen Thi Ninh', firstName: 'Nguyen Thi', lastName: 'Ninh', userName: 'ninhnt1.ho', extension: 2964 },
  // { id: 62, fullName: 'Ha Thi Chinh', firstName: 'Ha Thi', lastName: 'Chinh', userName: 'chinhht.ho', extension: 2756 },
  // { id: 63, fullName: 'Doan Phuong Dung', firstName: 'Doan Phuong', lastName: 'Dung', userName: 'dungdp.ho', extension: 2757 },
  // { id: 64, fullName: 'Nguyen Anh Tuyet', firstName: 'Nguyen Anh', lastName: 'Tuyet', userName: 'tuyetna.ho', extension: 2755 },
  // { id: 65, fullName: 'Pho Duc Binh An', firstName: 'Pho Duc Binh', lastName: 'An', userName: 'anpdb.ho', extension: 2997 },
  // { id: 66, fullName: 'Luu Viet Anh', firstName: 'Luu Viet', lastName: 'Anh', userName: 'anhlv.ho', extension: 2005 },
  // { id: 67, fullName: 'Nguyen Tuan Nghia', firstName: 'Nguyen Tuan', lastName: 'Nghia', userName: 'nghiant1.ho', extension: 2006 },

  // { id: 68, fullName: 'Mai Hoang Vu', firstName: 'Mai Hoang', lastName: 'Vu', userName: 'vumh.ho', extension: 2998 },
];

const userRole = [
  { userId: 1, role: 2 },
  // { userId: 2, role: 0 },
  // { userId: 2, role: 1 },
  // { userId: 3, role: 0 },
  // { userId: 3, role: 1 },
  // { userId: 4, role: 0 },
  // { userId: 4, role: 1 },
  // { userId: 5, role: 0 },
  // { userId: 5, role: 1 },
  // { userId: 6, role: 0 },
  // { userId: 6, role: 1 },
  // { userId: 7, role: 0 },
  // { userId: 7, role: 1 },
  // { userId: 8, role: 0 },
  // { userId: 8, role: 1 },
  // { userId: 9, role: 0 },
  // { userId: 9, role: 1 },
  // { userId: 10, role: 0 },
  // { userId: 10, role: 1 },

  // { userId: 11, role: 0 },
  // { userId: 12, role: 0 },
  // { userId: 13, role: 0 },
  // { userId: 14, role: 0 },
  // { userId: 15, role: 0 },
  // { userId: 16, role: 0 },
  // { userId: 17, role: 0 },
  // { userId: 18, role: 0 },
  // { userId: 19, role: 0 },
  // { userId: 20, role: 0 },
  // { userId: 21, role: 0 },
  // { userId: 22, role: 0 },
  // { userId: 23, role: 0 },
  // { userId: 24, role: 0 },
  // { userId: 25, role: 0 },
  // { userId: 26, role: 0 },
  // { userId: 27, role: 0 },
  // { userId: 28, role: 0 },
  // { userId: 29, role: 0 },
  // { userId: 30, role: 0 },
  // { userId: 31, role: 0 },
  // { userId: 32, role: 0 },
  // { userId: 33, role: 0 },
  // { userId: 34, role: 0 },
  // { userId: 35, role: 0 },
  // { userId: 36, role: 0 },
  // { userId: 37, role: 0 },
  // { userId: 38, role: 0 },
  // { userId: 39, role: 0 },
  // { userId: 40, role: 0 },
  // { userId: 41, role: 0 },
  // { userId: 42, role: 0 },
  // { userId: 43, role: 0 },
  // { userId: 44, role: 0 },
  // { userId: 45, role: 0 },
  // { userId: 46, role: 0 },
  // { userId: 47, role: 0 },
  // { userId: 48, role: 0 },
  // { userId: 49, role: 0 },
  // { userId: 50, role: 0 },
  // { userId: 51, role: 0 },
  // { userId: 52, role: 0 },
  // { userId: 53, role: 0 },
  // { userId: 54, role: 0 },
  // { userId: 55, role: 0 },
  // { userId: 56, role: 0 },
  // { userId: 57, role: 0 },
  // { userId: 58, role: 0 },
  // { userId: 59, role: 0 },
  // { userId: 60, role: 0 },
  // { userId: 61, role: 0 },
  // { userId: 62, role: 0 },
  // { userId: 63, role: 0 },
  // { userId: 64, role: 0 },
  // { userId: 65, role: 0 },
  // { userId: 66, role: 0 },
  // { userId: 67, role: 0 },

  // { userId: 68, role: 0 },
  // { userId: 68, role: 1 },
];
const configurationcolums = [
  { userId: 67, configurationColums: "datadata" }
]
const teams = [
  { id: 1, name: 'Default', description: 'Đây là nhóm mặc định', created: 1 },
]

const agentTeamMember = [
  { teamId: 1, userId: 1, role: 2, createdAt: new Date(), updatedAt: new Date() }
]

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const newUsers = users.map((user) => {
        return {
          ...user,
          password: '123456aA@',
          created: 1,
          isAvailable: 0,
          isActive: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      const newUserRole = userRole.map((role) => {
        return {
          ...role,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      const newTeam = teams.map((team) => {
        return {
          ...team,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      const newconfigurationcolums = configurationcolums.map((data) => {
        return {
          ...data,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      await queryInterface.bulkInsert('Users', newUsers, {}, { 'id': { autoIncrement: true } });

      await queryInterface.bulkInsert('UserRoles', newUserRole, {});

      await queryInterface.bulkInsert('Teams', newTeam, {}, { 'id': { autoIncrement: true } });

      // await queryInterface.bulkInsert('AgentTeamMembers', agentTeamMember, {});
      // await queryInterface.bulkInsert('configurationcolums', newconfigurationcolums, {});

    } catch (error) {
      console.log(error);
    }
  },

  async down(queryInterface, Sequelize) {
    // queryInterface.bulkDelete('Users', null, {});

    // queryInterface.bulkDelete('UserRoles', null, {});

    // queryInterface.bulkDelete('Teams', null, {});

    // queryInterface.bulkDelete('AgentTeamMembers', null, {});
  }
};

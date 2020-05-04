<template>
    <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
        <el-alert
            title="注意:只可以选中第三级分类"
            type="warning" :closable="false" show-icon>
        </el-alert>
        <el-row class="cat_opt">
            <el-col>
                <span>选择商品分类:</span>
                <el-cascader
                    class="casClass"
                    v-model="selectKeys"
                    :options="catList"
                    :props="{ expandTrigger: 'hover',value:'cat_id',label:'cat_name',children:'children' }"
                    @change="parentCateChange"
                    clearable>
                </el-cascader>
            </el-col>
        </el-row>
        <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="动态参数" name="many">
            <el-button type="primary" size="mini" :disabled="isBtnDisable" @click="addAttrDialogVisible=true">添加参数</el-button>
            <el-table :data="manyTableData" border stripe>
                <el-table-column type="expand">
                  <template slot-scope="scope">
                    <el-tag v-for="(item,index) in scope.row.attr_vals"
                    :key="index"
                    closable
                    @close="removeTag(index,scope.row)">
                      {{item}}
                    </el-tag>
                    <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                    >
                    </el-input>
                    <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+添加标签</el-button>
                  </template>
                </el-table-column>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="">
                        <el-button size="mini" type="primary" icon="el-icon-edit" >编辑</el-button>
                        <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
            <el-button type="primary" size="mini" :disabled="isBtnDisable"  @click="addAttrDialogVisible=true">添加属性</el-button>
            <el-table :data="onlyTableData" border stripe>
                <el-table-column type="expand">
                  <template slot-scope="scope">
                    <el-tag v-for="(item,index) in scope.row.attr_vals"
                    :key="index"
                    closable
                    @close="removeTag(index,scope.row)">
                      {{item}}
                    </el-tag>
                    <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                    >
                    </el-input>
                    <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+添加标签</el-button>
                  </template>
                </el-table-column>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="">
                        <el-button size="mini" type="primary" icon="el-icon-edit" >编辑</el-button>
                        <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-tab-pane>
        </el-tabs>
    </el-card>
      <el-dialog :title="'添加'+titleText" :visible.sync="addAttrDialogVisible" width="50%" @close="addAttrDialogClose">
      <el-form :model="addAttrForm" :rules="addAttrFormRules" ref="addAttrFormRef" label-width="100px" >
        <el-form-item  :label="titleText" prop="attr_name">
          <el-input v-model="addAttrForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addAttrDialogVisible = false">取 消</el-button>
        <el-button type="primary"  @click="addAttr">确 定</el-button>
      </span>
    </el-dialog>
    </div>
</template>
<script>
export default {
  data () {
    return {
      catList: [],
      selectKeys: [],
      activeName: 'many',
      manyTableData: [],
      onlyTableData: [],
      addAttrDialogVisible: false,
      addAttrForm: { attr_name: '' },
      addAttrFormRules:
      {
        attr_name: [{ required: true, message: '请输入参数名称', trigger: 'blur' }]
      }

    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品父级分类列表失败')
      }
      this.catList = res.data
    },
    async parentCateChange () {
      if (this.selectKeys.length !== 3) {
        this.selectKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数列表失败')
      }
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        item.inputVisible = false
        item.inputValue = ''
      })
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    handleClick () {
      this.parentCateChange()
    },
    addAttrDialogClose () {
      this.$refs.addAttrFormRef.resetFields()
    },
    addAttr () {
      this.$refs.addAttrFormRef.validate(async valid => {
        if (!valid) { return }
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`,
          { attr_name: this.addAttrForm.attr_name,
            attr_sel: this.activeName })
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败')
        }
        this.addAttrDialogVisible = false
        this.parentCateChange()
        return this.$message.success('添加分类成功')
      })
    },
    async handleInputConfirm (data) {
      if (data.inputValue.trim().length === 0) {
        data.inputValue = ''
        data.inputVisible = false
        return
      }
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${data.attr_id}`,
        { attr_name: data.attr_name,
          attr_sel: data.attr_sel,
          attr_vals: data.attr_vals.join(' ') })
      if (res.meta.status !== 200) {
        return this.$message.error('添加标签失败')
      }
      this.$message.success('添加标签成功')
      data.attr_vals.push(data.inputValue)
      data.inputValue = ''
      data.inputVisible = false
    },
    showInput (data) {
      data.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    async removeTag (i, data) {
      data.attr_vals.splice(i, 1)
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${data.attr_id}`,
        { attr_name: data.attr_name,
          attr_sel: data.attr_sel,
          attr_vals: data.attr_vals.join(' ') })
      if (res.meta.status !== 200) {
        return this.$message.error('删除标签失败')
      }
      this.$message.success('删除标签成功')
    }

  },
  computed: {
    isBtnDisable () {
      if (this.selectKeys.length !== 3) {
        return true
      }
      return false
    },
    cateId () {
      if (this.selectKeys.length === 3) {
        return this.selectKeys[2]
      }
      return null
    },
    titleText () {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }

  }
}
</script>

<style scoped>
.cat_opt{
    margin: 15px 0px;
}
  .el-tag + .el-tag {
    margin-left: 10px;
  }
  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }
</style>
